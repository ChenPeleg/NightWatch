import {PreferenceModel} from '../models/Preference.model';
import {defaultPreferenceValues, defaultVehicleValues, IAction, SessionModel, ShmiraListStore} from './store.types';
import {SaveLoadService} from '../services/save-load.service';
import {ShmiraListReducer} from './shmiraList.reducer';
import {PreferenceReducer} from './preferenceReducer';
import {ImportExportReducer} from './import-export.reducer';
import {VehicleModel} from '../models/Vehicle.model';
import {VehicleReducer} from './vehicle.reducer';
import {ActionsTypes} from './types.actions';
import {DisplayReducer} from './display.reducer';
import {ListSketchReducer} from './list-sketch.reducer';
import {PendingPreferencesReducer} from './pendingPreferencesReducer';
import {ListSketchNightReducer} from './list-sketch-night.reducer';
import {LocationGroupReducer} from './locationGroup.reducer';
import {defaultShmiraListEshbal} from './store-inital-state';
import {DateRangesReducer} from './date-ranges.reducer';
import {Utils} from '../services/utils';


const startPreferences: PreferenceModel[] = ['חן', 'אבי', 'רוני'].map((name: string, index: number): PreferenceModel => ({
    ...defaultPreferenceValues,
    id: (index + 1).toString(),
    guardName: name
}));
const startVehicles: VehicleModel[] = ['סנאו', 'שלגיה', 'שכור', 'מאזדה'].map((name: string, index: number): VehicleModel => ({
    ...defaultVehicleValues,
    id: (index + 1).toString(),
    vehicleName: name,

}))
const sessionState: SessionModel = {
    LocationGroupTabOpen: null,
    SketchIdInEdit: null,
    locationGroupInEdit: null,
    preferenceIdInEdit: null,
    pendingPreferenceIdInEdit: null,
    dataHolderForCurrentPreferenceInEdit: null

}
// @ts-ignore
const defaultInitialState: ShmiraListStore = {
    shmiraListArchive: [],
    locationGroupInEdit: null,
    shmiraListCollection: [{
        id: '1',
        Name: 'רשימת שמירה 2021',
        preferences: [],
        deletedPreferences: [],
        vehicles: [defaultVehicleValues],
        sketches: [],
        chosenSketch: '',
        locationGroup: null,
        DateTo: Utils.Date.dateToDateStamp(new Date()),
        DateFrom: Number((Utils.Date.dateToDateStamp(new Date())) + 60).toString(),
    }, {...defaultShmiraListEshbal}

    ],
    shmiraListId: '1',
    preferences: startPreferences,
    vehicles: startVehicles,
    preferenceIdInEdit: '1',
    dataHolderForCurrentPreferenceInEdit: startPreferences[0] || null,
    deletedPreferences: [],
    defaultPreferenceValues: {...defaultPreferenceValues},
    sketches: [],
    displaySetting: {view: 'locationsView'},
    SketchIdInEdit: null,
    pendingPreferenceIdInEdit: null,
    currentSessionState: sessionState,
    LocationGroups: []

}

const stateFromLocalStorage: ShmiraListStore | undefined = SaveLoadService.loadFromLocalStorage('chen').data?.savedStore
const initialState = stateFromLocalStorage || defaultInitialState;

const reducer = (state: ShmiraListStore = initialState, action: IAction) => {
    let newState = {
        ...state
    }

    switch (action.type) {
        case ActionsTypes.CHOOSE_SIDUR:
        case ActionsTypes.RENAME_SIDUR:
        case ActionsTypes.ADD_NEW_SIDUR:
        case ActionsTypes.DELETE_SIDUR:
        case ActionsTypes.CLONE_SIDUR:
        case ActionsTypes.ARCHIVE_SIDUR:
        case ActionsTypes.MOVE_TO_ACTIVE_SIDUR:
        case  ActionsTypes.DELETE_FOREVER_SIDUR:

            return ShmiraListReducer[action.type](newState, action)

        case ActionsTypes.CLICKED_ORDER:
        case ActionsTypes.UPDATE_ORDER:
        case ActionsTypes.UPDATE_ORDER_IN_EDIT:
        case ActionsTypes.DELETE_ORDER:
        case ActionsTypes.ADD_NEW_ORDER:
        case ActionsTypes.CLONE_ORDER:

            return PreferenceReducer[action.type](newState, action)

        case ActionsTypes.EXPORT_ALL:
        case ActionsTypes.IMPORT_FILE_UPLOADED:
        case ActionsTypes.IMPORT_ORDERS_AS_TEXT:

            return ImportExportReducer[action.type](newState, action);

        case ActionsTypes.NEW_VEHICLE:
        case ActionsTypes.UPDATE_VEHICLE:
        case ActionsTypes.DELETE_VEHICLE:

            return VehicleReducer[action.type](newState, action)
        case ActionsTypes.CHANGE_VIEW:
            return DisplayReducer[action.type](newState, action)


        case ActionsTypes.NEW_SKETCH:
        case ActionsTypes.CHOOSE_SKETCH:
        case  ActionsTypes.CLONE_SKETCH:
        case ActionsTypes.RENAME_SKETCH:
        case ActionsTypes.DELETE_SKETCH:
            return ListSketchReducer [action.type](newState, action)

        case ActionsTypes.CLICKED_PENDING_ORDER:
        case ActionsTypes.CLICKED_CLOSE_PENDING_ORDER:
        case ActionsTypes.CLICKED_REMOVE_PENDING_ORDER :
        case ActionsTypes.CLICKED_MERGE_PENDING_ORDER :
        case ActionsTypes.CLICKED_SPLIT_PENDING_ORDER :
        case ActionsTypes.CLICKED_CHANGE_PENDING_ORDER  :
        case ActionsTypes.CLICKED_CHANGE_TIME_PENDING_ORDER  :
        case ActionsTypes.CLICKED_REPLACE_EXISTING_PENDING_ORDER  :
        case ActionsTypes.CLICKED_PUBLIC_TRANSPORT_PENDING_ORDER  :
        case ActionsTypes.CLICKED_ADD_TO_PENDING_PENDING_ORDER:

            return PendingPreferencesReducer [action.type](newState, action)
        case ActionsTypes.DELETE_SKETCH_DRIVE:
        case ActionsTypes.UPDATE_SKETCH_DRIVE:
        case ActionsTypes.REMOVE_ORDER_FROM_SKETCH_DRIVE:
            return ListSketchNightReducer [action.type](newState, action);

        case   ActionsTypes.UPDATE_LOCATION_GROUP :
        case  ActionsTypes.DELETE_LOCATION_GROUP :
        case ActionsTypes.NEW_LOCATION_GROUP :
        case ActionsTypes.CLONE_LOCATION_GROUP :
        case ActionsTypes.RENAME_LOCATION_GROUP:
        case ActionsTypes.CHOOSE_LOCATION_GROUP:
        case ActionsTypes.CHOOSE_LOCATION_GROUP_TAB:

            return LocationGroupReducer [action.type](newState, action)

        case ActionsTypes.DATE_RANGES_UPDATE:
            return DateRangesReducer[action.type](newState, action)

        default:
            break;

    }

    return newState
}
export default reducer
