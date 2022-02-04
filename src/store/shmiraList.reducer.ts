import {ActionsTypes} from './types.actions';
import {AppConstants, defaultDaysBetweenGuardDuty, IAction, ShmiraListRecord, ShmiraListStore} from './store.types';
import {PreferenceModel} from '../models/Preference.model';
import {Utils} from '../services/utils';
import {translations} from '../services/translations';
import {StoreUtils} from './store-utils';
import {CloneUtil} from '../services/clone-utility';

export type ShmiraListReducerFunctions =
    ActionsTypes.RENAME_SIDUR
    | ActionsTypes.DELETE_SHMIRA
    | ActionsTypes.ADD_NEW_SHMIRA
    | ActionsTypes.CHOOSE_SIDUR
    | ActionsTypes.CLONE_SIDUR
    | ActionsTypes.ARCHIVE_SIDUR
    | ActionsTypes.MOVE_TO_ACTIVE_SIDUR
    | ActionsTypes.DELETE_FOREVER_SIDUR | ActionsTypes.UPDATE_DAYS_BETWEEN

const DefaultShmiraList: ShmiraListRecord = {
    id: '1',
    Name: 'My new guard roster',
    preferences: [],
    deletedPreferences: [],
    daysBetweenGuardDuty: defaultDaysBetweenGuardDuty,
    sketches: [],
    chosenSketch: '',
    locationGroup: null,

    DateFrom: Utils.Date.dateToDateStamp(new Date()),
    DateTo: (Number((Utils.Date.dateToDateStamp(new Date()))) + 30).toString()

}

export const ShmiraListReducer: Record<ShmiraListReducerFunctions, (state: ShmiraListStore, action: IAction) => ShmiraListStore> = {
    [ActionsTypes.CHOOSE_SIDUR]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}
        const chosenShmiraListId = action.payload.id;
        const previousShmiraListId = newState.shmiraListId;
        if (chosenShmiraListId === previousShmiraListId) {
            return newState
        }
        newState.shmiraListId = chosenShmiraListId;
        const chosenShmiraListObj: ShmiraListRecord | undefined = newState.shmiraListCollection.find((record: ShmiraListRecord) => record.id === chosenShmiraListId);
        if (chosenShmiraListObj !== undefined) {
            const previousShmiraListObj: ShmiraListRecord | undefined = newState.shmiraListCollection.find((record: ShmiraListRecord) => record.id === previousShmiraListId);
            if (previousShmiraListObj !== undefined) {
                const NewPreviousShmiraListObj = {...previousShmiraListObj};
                NewPreviousShmiraListObj.preferences = newState.preferences.map(o => ({
                    ...o
                }));
                NewPreviousShmiraListObj.deletedPreferences = newState.deletedPreferences.map(o => ({
                    ...o
                }));
                NewPreviousShmiraListObj.sketches = newState.sketches.map(o => ({
                    ...o
                }));
                NewPreviousShmiraListObj.daysBetweenGuardDuty = newState.daysBetweenGuardDuty;

                NewPreviousShmiraListObj.defaultPreferenceValues = {
                    ...
                        NewPreviousShmiraListObj
                            .defaultPreferenceValues
                } as PreferenceModel;
                newState.shmiraListCollection = newState.shmiraListCollection.map((shmiraList: ShmiraListRecord) => {
                    if (shmiraList.id === previousShmiraListId) {
                        return NewPreviousShmiraListObj
                    } else {
                        return shmiraList
                    }
                })
            }

            newState = setChosenShmiraList(newState, chosenShmiraListObj);


        }
        return newState

    },
    [ActionsTypes.RENAME_SIDUR]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}
        const shmiraListId = action.payload.id// newState.shmiraListId;
        const newName = action.payload.value;
        if (!newName) {
            return newState
        }
        newState.shmiraListCollection = newState.shmiraListCollection.map((shmiraList: ShmiraListRecord) => {
            if (shmiraList.id === shmiraListId) {
                const updatedShmiraList = {...shmiraList};
                updatedShmiraList.Name = newName;
                return updatedShmiraList
            } else {
                return shmiraList
            }
        });
        return newState
    },
    [ActionsTypes.UPDATE_DAYS_BETWEEN]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}
        const shmiraListId = newState.shmiraListId// newState.shmiraListId;
        const newNumber = action.payload.value;
        // @ts-ignore
        delete newState['vehicles'];
        newState.shmiraListCollection = newState.shmiraListCollection.map((shmiraList: ShmiraListRecord) => {
            if (shmiraList.id === shmiraListId) {
                const updatedShmiraList = {...shmiraList};
                updatedShmiraList.daysBetweenGuardDuty = newNumber;
                newState.daysBetweenGuardDuty = newNumber;
                return updatedShmiraList
            } else {
                return shmiraList
            }
        });
        newState.daysBetweenGuardDuty = newNumber;
        StoreUtils.HandleReducerSaveToLocalStorage(newState);
        return newState
    },
    [ActionsTypes.DELETE_SHMIRA]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}
        const shmiraListIdToDelete = action.payload.id// newState.shmiraListId;
        if (shmiraListIdToDelete.includes(AppConstants.ArchiveIdPrefix)) {
            newState.shmiraListArchive = newState.shmiraListArchive.map(shmiraList => {
                if (shmiraListIdToDelete === shmiraList.id) {
                    const updatedShmiraList = {...shmiraList};
                    updatedShmiraList.id = updatedShmiraList.id.replace(AppConstants.ArchiveIdPrefix, AppConstants.deleteIdPrefix);
                    return updatedShmiraList
                }
                return shmiraList
            })
        } else {
            let deletedShmiraList: ShmiraListRecord | undefined = newState.shmiraListCollection.find(s => s.id === shmiraListIdToDelete);
            if (deletedShmiraList) {
                deletedShmiraList = {...deletedShmiraList};
                deletedShmiraList.id = 'Del' + deletedShmiraList.id;
                newState.shmiraListArchive.push(deletedShmiraList);
            }
            newState.shmiraListCollection = newState.shmiraListCollection.filter(s => s.id !== shmiraListIdToDelete);
        }

        if (!newState.shmiraListCollection.length) {
            newState.shmiraListCollection.push(getDefaultShmiraList(newState));
        }
        if (newState.shmiraListId === shmiraListIdToDelete) {
            const chosenShmiraListAfterDelete: ShmiraListRecord = newState.shmiraListCollection[0];
            newState.shmiraListId = chosenShmiraListAfterDelete.id
            newState = setChosenShmiraList(newState, chosenShmiraListAfterDelete);
        }

        StoreUtils.HandleReducerSaveToLocalStorage(newState);
        return newState
    },
    [ActionsTypes.ARCHIVE_SIDUR]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}
        const shmiraListIdToArchive = action.payload.id;
        if (shmiraListIdToArchive.includes(AppConstants.deleteIdPrefix)) {
            newState.shmiraListArchive = newState.shmiraListArchive.map(shmiraList => {
                if (shmiraListIdToArchive === shmiraList.id) {
                    const updatedShmiraList = {...shmiraList};
                    updatedShmiraList.id = updatedShmiraList.id.replace(AppConstants.ArchiveIdPrefix, AppConstants.deleteIdPrefix);
                    return updatedShmiraList
                }
                return shmiraList
            })
        } else {
            let archivedShmiraList: ShmiraListRecord | undefined = newState.shmiraListCollection.find(s => s.id === shmiraListIdToArchive);
            if (archivedShmiraList) {
                archivedShmiraList = {...archivedShmiraList};
                archivedShmiraList.id = AppConstants.ArchiveIdPrefix + archivedShmiraList.id;
                newState.shmiraListArchive.push(archivedShmiraList);
                newState.shmiraListCollection = newState.shmiraListCollection.filter(s => s.id !== shmiraListIdToArchive);
            }

        }


        if (!newState.shmiraListCollection.length) {
            newState.shmiraListCollection.push(getDefaultShmiraList(newState));
        }
        if (newState.shmiraListId === shmiraListIdToArchive) {
            const chosenShmiraListAfterArchive: ShmiraListRecord = newState.shmiraListCollection[0];
            newState.shmiraListId = chosenShmiraListAfterArchive.id
            newState = setChosenShmiraList(newState, chosenShmiraListAfterArchive);
        }
        StoreUtils.HandleReducerSaveToLocalStorage(newState);
        return newState
    },
    [ActionsTypes.ADD_NEW_SHMIRA]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}

        const newShmiraListId = Utils.getNextId(getAllShmiraListIDs(state))
        const newShmiraList: ShmiraListRecord = {
            id: newShmiraListId,
            Name: translations.ShmiraList + ' ' + newShmiraListId,
            preferences: [],
            deletedPreferences: [],
            daysBetweenGuardDuty: defaultDaysBetweenGuardDuty,
            defaultPreferenceValues: newState.defaultPreferenceValues,
            sketches: [],
            chosenSketch: '',
            locationGroup: null,
            DateFrom: Utils.Date.dateToDateStamp(new Date()),
            DateTo: (Number((Utils.Date.dateToDateStamp(new Date()))) + 30).toString()
        }
        newState.shmiraListCollection = newState.shmiraListCollection.map(c => c);
        newState.shmiraListCollection.push(newShmiraList);
        newState.shmiraListId = newShmiraListId;
        newState = setChosenShmiraList(newState, newShmiraList);
        StoreUtils.HandleReducerSaveToLocalStorage(newState);
        return newState
    },
    [ActionsTypes.CLONE_SIDUR]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}
        const shmiraListIdToClone = action.payload.id;// newState.shmiraListId;
        let shmiraListForCloning: ShmiraListRecord | undefined = newState.shmiraListCollection.find(s => s.id === shmiraListIdToClone);

        if (shmiraListForCloning) {
            const newShmiraList: ShmiraListRecord = CloneUtil.deepCloneShmiraList(shmiraListForCloning);
            newShmiraList.Name = translations.CopyOf + ' ' + newShmiraList.Name;
            const newShmiraListId = Utils.getNextId(getAllShmiraListIDs(state));
            newShmiraList.id = newShmiraListId
            newState.shmiraListCollection = newState.shmiraListCollection.map(c => c);
            newState.shmiraListCollection.push(newShmiraList);
            newState.shmiraListId = newShmiraListId;
            newState = setChosenShmiraList(newState, newShmiraList);
        }
        StoreUtils.HandleReducerSaveToLocalStorage(newState);
        return newState
    },
    [ActionsTypes.MOVE_TO_ACTIVE_SIDUR]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}
        const shmiraListIdToActivate = action.payload.id;

        let toActivateShmiraList: ShmiraListRecord | undefined = newState.shmiraListArchive.find(s => s.id === shmiraListIdToActivate);
        if (toActivateShmiraList) {
            toActivateShmiraList = {...toActivateShmiraList};

            toActivateShmiraList.id = StoreUtils.removeIdPrefix(toActivateShmiraList.id);
            newState.shmiraListCollection.push(toActivateShmiraList);
            newState.shmiraListArchive = newState.shmiraListArchive.filter(s => s.id !== shmiraListIdToActivate);
        }


        return newState
    },
    [ActionsTypes.DELETE_FOREVER_SIDUR]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}
        const shmiraListIdToDeleteForever = action.payload.id;
        newState.shmiraListArchive = newState.shmiraListArchive.filter(s => s.id !== shmiraListIdToDeleteForever);
        StoreUtils.HandleReducerSaveToLocalStorage(newState);
        return newState
    },


}
const setChosenShmiraList = (state: ShmiraListStore, chosenShmiraList: ShmiraListRecord): ShmiraListStore => {
    const newState = {...state};

    newState.preferences = chosenShmiraList?.preferences.map(o => ({...o})) || []
    newState.daysBetweenGuardDuty = chosenShmiraList?.daysBetweenGuardDuty
    newState.deletedPreferences = chosenShmiraList?.deletedPreferences?.map(o => ({...o})) || [];
    newState.sketches = chosenShmiraList?.sketches?.map(o => ({...o})) || [];
    if (newState.SketchIdInEdit) {
        const sketchInEdit = newState.sketches.find(s => s.id === newState.SketchIdInEdit);
        if (sketchInEdit) {
            newState.nights = sketchInEdit.NightSchedule
        }
    }
    newState.preferenceIdInEdit = null;
    newState.dataHolderForCurrentPreferenceInEdit = null;
    return newState

}
const getAllShmiraListIDs = (state: ShmiraListStore): string[] => {
    const collectionIds = state.shmiraListCollection.map(o => o.id);
    const ArchiveIdsWithWords = state.shmiraListArchive.map(o => o.id);

    const ArchiveIds = ArchiveIdsWithWords.map(id => StoreUtils.removeIdPrefix(id))
    return [...ArchiveIds, ...collectionIds]
}

const getDefaultShmiraList = (state: ShmiraListStore): ShmiraListRecord => {
    const newShmiraList: ShmiraListRecord = {...DefaultShmiraList};
    newShmiraList.id = Utils.getNextId(getAllShmiraListIDs(state));
    const allNames = [...state.shmiraListCollection.map(o => o.Name), ...state.shmiraListArchive.map(o => o.Name)];
    if (allNames.some(name => name === newShmiraList.Name)) {
        newShmiraList.Name = newShmiraList.Name + ' ' + newShmiraList.id
    }
    return newShmiraList

}
