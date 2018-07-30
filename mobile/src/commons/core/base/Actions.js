import pluralize from "pluralize";

import * as Types from "__src/commons/types";

class Actions {
	constructor(api) {
		this._api = api;

		const singularOps = [
			"findById",
			"findOne",
			"create",
			"findOrCreate",
			"upsert",
		];

		const pluralOps = [
			"findAndCount",
			"findAll",
			"update",
			"destroy",
		];

		this._ops = {};
		for (const op of singularOps) {
			this._ops[`${ op }${ api.name }`] = this._operation(op);
		}

		for (const op of pluralOps) {
			this._ops[`${ op }${ pluralize(api.name) }`] = this._operation(op);
		}
	}

	get ops() {
		return this._ops;
	}

	_operation = (op) => (id, options = {}, attributes = [ "id" ]) => (
		async (dispatch) => {
			try {
				dispatch({ type: Types.ONGOING, name: this._api.name, id });

				const result = await this._api[op](options, attributes);

				dispatch({ type: Types.DONE, name: this._api.name, id, result });
			} catch (error) {
				dispatch({ type: Types.ERROR, name: this._api.name, id, errors: error });
			}
		}
	)
}

export default Actions;
