import Sequelize from "sequelize";
import _ from "lodash";
import debug from "debug";
import path from "path";

const log = debug("therion:server:DataManager");
const env = process.env.NODE_ENV || "development";

class DataManager {
	initialize = async (models, controllers, config) => {
		try {
			this._definitions = models;
			this._controllers = controllers;
			this._config = config;

			const datastore = this._config.Datastore[env];

			this._manager = new Sequelize(datastore.name,
				datastore.username, datastore.password, {
					host: datastore.host,
					dialect: datastore.dialect,
					timezone: datastore.timezone,
					storage: path.join(datastore.location || "", datastore.name) || null,
					pool: {
						max: 5,
						min: 0,
						acquire: 30000,
						idle: 10000,
					},

					// http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
					operatorsAliases: false,
					define: {
						defaultScope: {
							attributes: {
								exclude: ["createdAt", "updatedAt"],
							},
						},
					},
				});

			log(`Database connection to ${datastore.host} has been established successfully.`);

			// Instantiate models
			this._models = _.transform(this._definitions, (r, modelDef, name) => {
				// const modelDef = this._definitions[name];

				log(name);

				r[name] = this.manager.define(_.camelCase(name), modelDef.attributes);
				r[name].description = modelDef.description;

				if (modelDef.tableName) {
					r[name].tableName = modelDef.tableName;
				}

				if (modelDef.timestamps) {
					r[name].timestamps = false;
				}

				if (modelDef.date) {
					r[name].timestamps = false;
				}

				if (controllers[name]) {
					_.forEach(controllers[name].hooks, (v, k) => {
						r[name].hook(k, v);
					});
				}
			}, {});

			// Construct relationships
			_.forEach(this._definitions, (modelDef, name) => {
				if ("associations" in modelDef) {
					_.forEach(modelDef.associations, (association) => {
						this._models[name][association.type](
							this._models[association.model], {
								as: association.alias,
								foreignKey: association.foreignKey,
								otherKey: association.otherKey,
								through: association.through,
							});
					}, this);
				}
			});

			const mode = this._config.Datastore.mode;
			const options = (() => {
				switch (mode) {
				case "alter":
					return {
						alter: true,
					};
				case "safe":
					return {};
				}
			})();

			if (mode === "drop") {
				await this._manager.drop();
			}

			for (const k of Object.keys(this._models)) {
				await this._models[k].sync(options);
			}
		} catch (e) {
			log(e);
			throw e;
		}

		return this;
	}

	get manager() {
		return this._manager;
	}

	get models() {
		return this._models;
	}
}

export default DataManager;
