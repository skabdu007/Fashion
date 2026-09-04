require("dotenv").config();
const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "fashion",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      freezeTableName: true
    }
  }
);

Sequelize.Model.prototype.toObject = function () {
  return this.get({ plain: true });
};

// Convert Mongoose-style query filters to Sequelize where clause
function convertMongooseQuery(query = {}) {
  if (!query || typeof query !== "object") return {};
  if (query.where) return query; // Already a Sequelize query option

  const where = {};

  for (const [key, val] of Object.entries(query)) {
    if (key === "$or" && Array.isArray(val)) {
      where[Op.or] = val.map((item) => {
        const converted = convertMongooseQuery(item);
        return converted.where ? converted.where : converted;
      });
      continue;
    }
    if (key === "$and" && Array.isArray(val)) {
      where[Op.and] = val.map((item) => {
        const converted = convertMongooseQuery(item);
        return converted.where ? converted.where : converted;
      });
      continue;
    }

    if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
      const fieldOps = {};
      for (const [opKey, opVal] of Object.entries(val)) {
        if (opKey === "$lt") fieldOps[Op.lt] = opVal;
        else if (opKey === "$lte") fieldOps[Op.lte] = opVal;
        else if (opKey === "$gt") fieldOps[Op.gt] = opVal;
        else if (opKey === "$gte") fieldOps[Op.gte] = opVal;
        else if (opKey === "$ne") fieldOps[Op.ne] = opVal;
        else if (opKey === "$in") fieldOps[Op.in] = opVal;
        else if (opKey === "$regex") {
          fieldOps[Op.like] = `%${opVal}%`;
        } else if (opKey === "$options") {
          // Case insensitive handled by MySQL collation
        } else {
          fieldOps[opKey] = opVal;
        }
      }
      where[key] = fieldOps;
    } else {
      where[key] = val;
    }
  }

  return { where };
}

// Attach Mongoose-compatible shim methods to a Sequelize model
function enhanceModel(model) {
  // Model.findById(id)
  model.findById = function (id) {
    const pk = id && typeof id === "object" && id._id ? id._id : id;
    let selectedAttributes = null;
    const populateOptions = [];

    const execute = async () => {
      const options = {};
      if (selectedAttributes) options.attributes = selectedAttributes;
      let doc = await model.findByPk(pk, options);
      if (doc && populateOptions.length) {
        doc = await applyPopulates(doc, populateOptions);
      }
      return doc;
    };

    const chain = {
      select(fields) {
        selectedAttributes = parseSelect(fields);
        return chain;
      },
      populate(opt, fields) {
        populateOptions.push({ opt, fields });
        return chain;
      },
      lean() {
        return chain;
      },
      then(onFulfilled, onRejected) {
        return execute().then((doc) => {
          if (doc && selectedAttributes) {
            applyExclusions(doc, selectedAttributes);
          }
          return onFulfilled ? onFulfilled(doc) : doc;
        }, onRejected);
      },
      catch(onRejected) {
        return execute().catch(onRejected);
      }
    };

    return chain;
  };

  // Model.findOne(query)
  const originalFindOne = model.findOne.bind(model);
  model.findOne = function (query = {}) {
    const queryOpts = convertMongooseQuery(query);
    let selectedAttributes = null;
    let sortOrder = null;
    const populateOptions = [];

    const execute = async () => {
      const opts = { ...queryOpts };
      if (selectedAttributes) opts.attributes = selectedAttributes;
      if (sortOrder) opts.order = sortOrder;
      let doc = await originalFindOne(opts);
      if (doc && populateOptions.length) {
        doc = await applyPopulates(doc, populateOptions);
      }
      return doc;
    };

    const chain = {
      select(fields) {
        selectedAttributes = parseSelect(fields);
        return chain;
      },
      sort(sortArg) {
        sortOrder = parseSort(sortArg);
        return chain;
      },
      populate(opt, fields) {
        populateOptions.push({ opt, fields });
        return chain;
      },
      lean() {
        return chain;
      },
      then(onFulfilled, onRejected) {
        return execute().then((doc) => {
          if (doc && selectedAttributes) {
            applyExclusions(doc, selectedAttributes);
          }
          return onFulfilled ? onFulfilled(doc) : doc;
        }, onRejected);
      },
      catch(onRejected) {
        return execute().catch(onRejected);
      }
    };

    return chain;
  };

  // Model.find(query)
  const originalFindAll = model.findAll.bind(model);
  model.find = function (query = {}) {
    const queryOpts = convertMongooseQuery(query);
    let selectedAttributes = null;
    let sortOrder = [["createdAt", "DESC"]];
    let limitCount = null;
    let offsetCount = null;
    const populateOptions = [];

    const execute = async () => {
      const opts = { ...queryOpts };
      if (selectedAttributes && Array.isArray(selectedAttributes)) {
        opts.attributes = selectedAttributes;
      }
      if (sortOrder) opts.order = sortOrder;
      if (limitCount !== null) opts.limit = limitCount;
      if (offsetCount !== null) opts.offset = offsetCount;

      const docs = await originalFindAll(opts);
      if (populateOptions.length) {
        return await Promise.all(docs.map((d) => applyPopulates(d, populateOptions)));
      }
      return docs;
    };

    const chain = {
      select(fields) {
        selectedAttributes = parseSelect(fields);
        return chain;
      },
      sort(sortArg) {
        sortOrder = parseSort(sortArg);
        return chain;
      },
      limit(n) {
        limitCount = Number(n);
        return chain;
      },
      skip(n) {
        offsetCount = Number(n);
        return chain;
      },
      populate(opt, fields) {
        populateOptions.push({ opt, fields });
        return chain;
      },
      lean() {
        return chain;
      },
      then(onFulfilled, onRejected) {
        return execute().then(onFulfilled, onRejected);
      },
      catch(onRejected) {
        return execute().catch(onRejected);
      }
    };

    return chain;
  };

  // Model.findByIdAndUpdate(id, data, options)
  model.findByIdAndUpdate = function (id, data = {}, options = {}) {
    const pk = id && typeof id === "object" && id._id ? id._id : id;
    let selectedAttributes = null;
    const populateOptions = [];

    const execute = async () => {
      const doc = await model.findByPk(pk);
      if (!doc) return null;

      let updatedFields = { ...data };

      if (data.$inc) {
        delete updatedFields.$inc;
        for (const [key, incVal] of Object.entries(data.$inc)) {
          const current = Number(doc.get(key) || 0);
          doc.set(key, current + Number(incVal));
        }
      }

      if (data.$set) {
        delete updatedFields.$set;
        Object.assign(updatedFields, data.$set);
      }

      if (data.$push) {
        delete updatedFields.$push;
        for (const [key, pushVal] of Object.entries(data.$push)) {
          const arr = doc.get(key) ? [...doc.get(key)] : [];
          arr.push(pushVal);
          doc.set(key, arr);
        }
      }

      doc.set(updatedFields);
      await doc.save();

      let result = doc;
      if (populateOptions.length) {
        result = await applyPopulates(doc, populateOptions);
      }
      if (selectedAttributes) {
        applyExclusions(result, selectedAttributes);
      }
      return result;
    };

    const chain = {
      select(fields) {
        selectedAttributes = parseSelect(fields);
        return chain;
      },
      populate(opt, fields) {
        populateOptions.push({ opt, fields });
        return chain;
      },
      then(onFulfilled, onRejected) {
        return execute().then(onFulfilled, onRejected);
      },
      catch(onRejected) {
        return execute().catch(onRejected);
      }
    };

    return chain;
  };

  // Model.findOneAndUpdate(query, data, options)
  model.findOneAndUpdate = async function (query = {}, data = {}, options = {}) {
    const queryOpts = convertMongooseQuery(query);
    const doc = await originalFindOne(queryOpts);
    if (!doc) return null;

    let updatedFields = { ...data };

    if (data.$inc) {
      delete updatedFields.$inc;
      for (const [key, incVal] of Object.entries(data.$inc)) {
        const current = Number(doc.get(key) || 0);
        doc.set(key, current + Number(incVal));
      }
    }

    if (data.$set) {
      delete updatedFields.$set;
      Object.assign(updatedFields, data.$set);
    }

    if (data.$push) {
      delete updatedFields.$push;
      for (const [key, pushVal] of Object.entries(data.$push)) {
        const arr = doc.get(key) ? [...doc.get(key)] : [];
        arr.push(pushVal);
        doc.set(key, arr);
      }
    }

    doc.set(updatedFields);
    await doc.save();
    return doc;
  };

  // Model.findByIdAndDelete(id)
  model.findByIdAndDelete = async function (id) {
    const pk = id && typeof id === "object" && id._id ? id._id : id;
    const doc = await model.findByPk(pk);
    if (!doc) return null;
    await doc.destroy();
    return doc;
  };

  // Model.countDocuments(query)
  model.countDocuments = async function (query = {}) {
    const queryOpts = convertMongooseQuery(query);
    return await model.count(queryOpts);
  };

  // Model.insertMany(docs)
  model.insertMany = async function (docs) {
    if (!Array.isArray(docs)) docs = [docs];
    return await model.bulkCreate(docs);
  };

  // Model.deleteMany(query)
  model.deleteMany = async function (query = {}) {
    const queryOpts = convertMongooseQuery(query);
    return await model.destroy(queryOpts);
  };

  return model;
}

// Parse select string (e.g. "-password -raw_password" or "name price image")
function parseSelect(fields) {
  if (!fields) return null;
  if (typeof fields !== "string") return fields;

  const parts = fields.trim().split(/\s+/);
  const exclusions = parts.filter((p) => p.startsWith("-")).map((p) => p.slice(1));
  const inclusions = parts.filter((p) => !p.startsWith("-") && !p.startsWith("+"));

  if (exclusions.length > 0) {
    return { exclude: exclusions };
  }
  return inclusions.length > 0 ? inclusions : null;
}

function applyExclusions(doc, sel) {
  if (!doc) return;
  if (sel && sel.exclude) {
    for (const key of sel.exclude) {
      if (doc.dataValues && key in doc.dataValues) {
        delete doc.dataValues[key];
      }
      delete doc[key];
    }
  }
}

// Parse sort string or object (e.g. { createdAt: -1 } or "-createdAt")
function parseSort(sortArg) {
  if (!sortArg) return [["createdAt", "DESC"]];

  if (typeof sortArg === "string") {
    const order = sortArg.startsWith("-") ? "DESC" : "ASC";
    const field = sortArg.replace(/^[-+]/, "");
    return [[field, order]];
  }

  if (typeof sortArg === "object") {
    const orders = [];
    for (const [key, dir] of Object.entries(sortArg)) {
      orders.push([key, dir === -1 || dir === "desc" || dir === "DESC" ? "DESC" : "ASC"]);
    }
    return orders.length ? orders : [["createdAt", "DESC"]];
  }

  return [["createdAt", "DESC"]];
}

// Dynamic populate helper for joins (e.g. products -> vendor, category)
async function applyPopulates(doc, populates) {
  if (!doc) return doc;
  const models = sequelize.models;

  for (const item of populates) {
    const opt = item.opt;
    const paths = Array.isArray(opt) ? opt : [opt];

    for (const p of paths) {
      const path = typeof p === "string" ? p : p.path;

      // Handle vendor_id -> Vendor
      if (path === "vendor_id" && models.Vendor && doc.vendor_id) {
        const vendor = await models.Vendor.findByPk(doc.vendor_id);
        if (vendor) {
          const vData = vendor.get({ plain: true });
          delete vData.password;
          doc.setDataValue
            ? doc.setDataValue("vendor_id", vData)
            : (doc.vendor_id = vData);
        }
      }

      // Handle category_id -> Category
      if (path === "category_id" && models.Category && doc.category_id) {
        const cat = await models.Category.findByPk(doc.category_id);
        if (cat) {
          const cData = cat.get({ plain: true });
          doc.setDataValue
            ? doc.setDataValue("category_id", cData)
            : (doc.category_id = cData);
        }
      }

      // Handle user_id -> Customer
      if (path === "user_id" && models.Customer && doc.user_id) {
        const customer = await models.Customer.findByPk(doc.user_id);
        if (customer) {
          const custData = customer.get({ plain: true });
          delete custData.password;
          delete custData.raw_password;
          doc.setDataValue
            ? doc.setDataValue("user_id", custData)
            : (doc.user_id = custData);
        }
      }

      // Handle items.product_id in Orders/Carts
      if ((path === "items.product_id" || path === "product_id") && models.Product) {
        if (doc.items && Array.isArray(doc.items)) {
          const populatedItems = await Promise.all(
            doc.items.map(async (it) => {
              if (!it.product_id) return it;
              const prod = await models.Product.findByPk(it.product_id);
              return {
                ...it,
                product_id: prod ? prod.get({ plain: true }) : it.product_id
              };
            })
          );
          doc.setDataValue
            ? doc.setDataValue("items", populatedItems)
            : (doc.items = populatedItems);
        } else if (doc.product_id) {
          const prod = await models.Product.findByPk(doc.product_id);
          if (prod) {
            const pData = prod.get({ plain: true });
            doc.setDataValue
              ? doc.setDataValue("product_id", pData)
              : (doc.product_id = pData);
          }
        }
      }
    }
  }

  return doc;
}

module.exports = {
  sequelize,
  DataTypes,
  Op,
  convertMongooseQuery,
  enhanceModel
};
