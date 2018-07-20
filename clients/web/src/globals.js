import _DataManager from "./core/managers/DataManager";
import _ApiFactory from "./core/managers/ApiFactory";
import * as models from "./__globals__/models";

export const DataManager = new _DataManager();
export const ApiFactory = new _ApiFactory(models);