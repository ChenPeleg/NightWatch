import {
    AppConstants,
    defaultDaysBetweenGuardDuty,
    defaultPreferenceValues,
    SaveDataModel,
    SessionModel,
    ShmiraListRecord,
    ShmiraListStore
} from './store.types';
import {SaveLoadService} from '../services/save-load.service';
import {hashFunction} from '../services/hash-function';
import {CloneUtil} from '../services/clone-utility';
import {Utils} from '../services/utils';
import {defaultShmiraListEshbal} from './store-inital-state';
import {PreferenceModel} from '../models/Preference.model';
import {SketchModel} from '../models/Sketch.model';
import {translations} from '../services/translations';
import {ActionsTypes} from './types.actions';


interface CSVRow {
    num: number,
    timeStamp: string,
    dateText: string,
    dateDay: string,
    guards: string,
    comments: string

}

export const StoreUtils = {
    removeIdPrefix: (id: string): string => {
        const replaceIdsNames: RegExp = new RegExp(AppConstants.ArchiveIdPrefix + '|' + AppConstants.deleteIdPrefix, 'g');
        return id.replace(replaceIdsNames, '')
    },
    HandleReducerSaveToLocalStorage: (state: ShmiraListStore): void => {
        const saveObj: SaveDataModel = StoreUtils.buildSaveDataModel(state, 'chen', 'chen')
        if (state.currentSessionState?.userName?.length > 0) {

            SaveLoadService.saveToLocalStorage(saveObj);
        }
    },
    shieldAnimationBeforeDispatch(dispatchingAction: () => void, dispatchFunct: any, delay: number = 600) {
        const callArguments = {
            type: ActionsTypes.START_LOADING_ANIMATION,
            payload: {
                value: null,
            }
        }
        dispatchFunct(callArguments)
        setTimeout(_ => {
            dispatchingAction();
        }, delay)

    },
    UpdateShmiraListCollectionWithCurrenShmiraList: (state: ShmiraListStore): ShmiraListRecord[] => {
        const newState = {...state}
        const shmiraListId = newState.shmiraListId;
        const updatedPreferences = newState.preferences.map(o => ({...o}));
        const updatedVehicles = newState.daysBetweenGuardDuty
        const updatedDeletedPreferences = newState.deletedPreferences.map(o => ({...o}));
        const updatedSketches = newState.sketches.map(o => ({...o}))
        newState.shmiraListCollection = newState.shmiraListCollection.map((shmiraList: ShmiraListRecord) => {
            if (shmiraList.id === shmiraListId) {
                const updatedShmiraList = {...shmiraList};
                updatedShmiraList.preferences = updatedPreferences;
                updatedShmiraList.daysBetweenGuardDuty = updatedVehicles;
                updatedShmiraList.sketches = updatedSketches;
                updatedShmiraList.deletedPreferences = updatedDeletedPreferences;
                return updatedShmiraList
            } else {
                return shmiraList
            }
        });
        return newState.shmiraListCollection
    },
    buildSaveDataModel: (state: ShmiraListStore, userName: string = 'chen', userId: string = 'chen'): SaveDataModel => {
        const hash = hashFunction(JSON.stringify(state))
        return {
            userName: 'chen',
            userId: 'chen',
            savedStore: state,
            timeStamp: SaveLoadService.getTimeStampFromDate(),
            hash: hash.toString()
        }

    },
    buildCSVFileFromSketch(sketch
                               :
                               SketchModel, preferences
                               :
                               PreferenceModel[]
    ):
        string {
        let rows: CSVRow[] = [];
        const GuardsDictionary: Record<string, string> = {};
        preferences.forEach(p => {
            GuardsDictionary[p.id] = p.guardName;
        })
        sketch.NightSchedule.forEach(night => {
            const nightDateText = Utils.Date.simpleDateFromDateStamp(night.date)
            const dayOfWeek = Utils.Date.getDatOfWeekTextFromTimeStamp(night.date);
            const guards = night.guards.map(g => GuardsDictionary[g] || '');
            const comments = night.guards?.length == 2 ? '' : translations.missingGuard
            const row: CSVRow = {
                dateDay: dayOfWeek,
                dateText: nightDateText,
                guards: guards.join(' + '),
                num: Number(night.date),
                timeStamp: night.date,
                comments: comments

            }
            rows.push(row)
        });
        const sortedRows = [...rows].sort(r => r.num);
        let finalText = translations.ShmiraList + ' ' + sketch.name + '\n';
        finalText += translations.dateSingle + ',' + translations.daySingle + ',' + translations.guards + ',' + translations.Comments + ',\n';
        sortedRows.forEach(row => {
            const textRow = row.dateText + ',' + row.dateDay + ',' + row.guards + ',' + row.comments + ',' + '\n';
            finalText += textRow

        })

        return finalText

    }
    ,
    updateShmiraListRecordWithSketchChanges(state
                                                :
                                                ShmiraListStore
    ):
        ShmiraListStore {
        const newState = {...state};
        const thisShmiraListInCollection: ShmiraListRecord | undefined = newState.shmiraListCollection.find((shmiraList: ShmiraListRecord) => shmiraList.id === newState.shmiraListId);


        if (thisShmiraListInCollection) {
            thisShmiraListInCollection.sketches = newState.sketches.map(s => CloneUtil.deepCloneSketch(s))
        }

        return newState

    }
    ,
    defaultInitialState()
        :
        ShmiraListStore {
        const startPreferences: PreferenceModel[] = ['חן', 'אבי', 'רוני'].map((name: string, index: number): PreferenceModel => ({
            ...defaultPreferenceValues,
            id: (index + 1).toString(),
            guardName: name
        }));
        const sessionState: SessionModel = {
            userName: '',
            LocationGroupTabOpen: null,
            SketchIdInEdit: null,
            locationGroupInEdit: null,
            preferenceIdInEdit: null,
            pendingPreferenceIdInEdit: null,
            dataHolderForCurrentPreferenceInEdit: null,
            isAnimationRunning: false

        }
        try {
            const parsedJson = JSON.parse(this.defaultJsonSavedData());
            if (parsedJson) {
                if (parsedJson.savedStore.currentSessionState && parsedJson.savedStore.currentSessionState.userName) {
                    parsedJson.savedStore.currentSessionState.userName = ''
                }
                return parsedJson.savedStore
            }
        } catch (e) {

        }

        return {
            shmiraListArchive: [],
            locationGroupInEdit: null,
            shmiraListCollection: [{
                id: '1',
                Name: 'רשימת שמירה 2021',
                preferences: [],
                deletedPreferences: [],
                daysBetweenGuardDuty: [defaultDaysBetweenGuardDuty],
                sketches: [],
                chosenSketch: '',
                locationGroup: null,
                DateTo: Utils.Date.dateToDateStamp(new Date()),
                DateFrom: Number((Utils.Date.dateToDateStamp(new Date())) + 60).toString(),
            }, {...defaultShmiraListEshbal}

            ],
            shmiraListId: '1',
            preferences: startPreferences,
            daysBetweenGuardDuty: defaultDaysBetweenGuardDuty,
            preferenceIdInEdit: '1',
            dataHolderForCurrentPreferenceInEdit: startPreferences[0] || null,
            deletedPreferences: [],
            defaultPreferenceValues: {...defaultPreferenceValues},
            sketches: [],
            nights: [],
            displaySetting: {view: 'locationsView'},
            SketchIdInEdit: null,
            pendingPreferenceIdInEdit: null,
            currentSessionState: sessionState,
            LocationGroups: [],


        }
    }
    ,
    defaultJsonSavedData()
        :
        string {
        const jsonString = `{"userName":"","userId":"chen","savedStore":{"shmiraListArchive":[],"locationGroupInEdit":null,"nights":[],"shmiraListCollection":[{"id":"1","Name":"Guard duty roster (Example)","preferences":[{"id":"34","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"2","flexibilityByDays":["2","4","3","1"],"flexibilityByDates":["44566","44569","44567","44563"],"location":"","weekDaysOrDates":"1","guardName":"Mandy"},{"id":"4","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","1","2"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1","guardName":"David"},{"id":"32","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","2"],"flexibilityByDates":["44570","44565","44568","44567","44566"],"location":"","weekDaysOrDates":"1","guardName":"Ron"},{"id":"9","guardName":"John","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","5"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"8","guardName":"Michael","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"5","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1","guardName":"William"},{"id":"31","guardName":"Natalie","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"30","guardName":"Elijah","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"29","guardName":"Daniel","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"28","guardName":"Susan","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","2","1","5","6"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"27","guardName":"Barbara","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"26","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","1","2"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1","guardName":"Bobby"},{"id":"25","guardName":"Rose","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"3","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"24","guardName":"Sophia","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"3","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"23","guardName":"Jessica","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"3","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"22","guardName":"Nancy","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"2","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565","44567","44568","44566","44563","44564","44562","44561","44560","44569","44571","44572"],"location":"","weekDaysOrDates":"2"},{"id":"21","guardName":"Anthony","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","5"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"20","guardName":"Paul","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"19","guardName":"Carol","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"18","guardName":"Ryan","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","1","2"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"17","guardName":"Billy","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"16","guardName":"Scott","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["1","2","5","6"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"15","guardName":"Rachel","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"14","guardName":"Maria","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"13","guardName":"Jean","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"12","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1","guardName":"Victoria"},{"id":"11","guardName":"Harold","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"10","guardName":"Gerald","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"}],"deletedPreferences":[],"sketches":[],"chosenSketch":"1","locationGroup":null,"DateTo":"44587","DateFrom":"44560","defaultPreferenceValues":{},"daysBetweenGuardDuty":"7"},{"id":"2","Name":"A new guard roster","preferences":[],"deletedPreferences":[],"daysBetweenGuardDuty":"6","defaultPreferenceValues":{"id":"1","guardName":"","optionalGuardDaysByDates":"08:00","finishHour":"09:00","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":[],"flexibilityByDates":[],"location":"","weekDaysOrDates":null},"sketches":[],"chosenSketch":"","locationGroup":null,"DateFrom":"44575","DateTo":"44605"}],"shmiraListId":"1","preferences":[{"id":"34","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"2","flexibilityByDays":["2","4","3","1"],"flexibilityByDates":["44566","44569","44567","44563"],"location":"","weekDaysOrDates":"1","guardName":"Mandy"},{"id":"4","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","1","2"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1","guardName":"David"},{"id":"32","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","2"],"flexibilityByDates":["44570","44565","44568","44567","44566"],"location":"","weekDaysOrDates":"1","guardName":"Ron"},{"id":"9","guardName":"John","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","5"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"8","guardName":"Michael","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"5","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1","guardName":"William"},{"id":"31","guardName":"Natalie","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"30","guardName":"Elijah","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"29","guardName":"Daniel","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"28","guardName":"Susan","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","2","1","5","6"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"27","guardName":"Barbara","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"26","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","1","2"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1","guardName":"Bobby"},{"id":"25","guardName":"Rose","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"3","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"24","guardName":"Sophia","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"3","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"23","guardName":"Jessica","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"3","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"22","guardName":"Nancy","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"2","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565","44567","44568","44566","44563","44564","44562","44561","44560","44569","44571","44572"],"location":"","weekDaysOrDates":"2"},{"id":"21","guardName":"Anthony","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","5"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"20","guardName":"Paul","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"19","guardName":"Carol","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"18","guardName":"Ryan","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3","1","2"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"17","guardName":"Billy","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"16","guardName":"Scott","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["1","2","5","6"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"15","guardName":"Rachel","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"14","guardName":"Maria","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"13","guardName":"Jean","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"12","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1","guardName":"Victoria"},{"id":"11","guardName":"Harold","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"},{"id":"10","guardName":"Gerald","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"1","flexibilityByDays":["4","3"],"flexibilityByDates":["44570","44565"],"location":"","weekDaysOrDates":"1"}],"preferenceIdInEdit":"34","dataHolderForCurrentPreferenceInEdit":{"id":"34","optionalGuardDaysByDates":"","finishHour":"","TypeOfInfoPreference":"2","Comments":"","halfOrFull":"2","flexibilityByDays":["2","4","3","1"],"flexibilityByDates":["44566","44569","44567","44563"],"location":"","weekDaysOrDates":"1","guardName":"Mandy"},"deletedPreferences":[],"defaultPreferenceValues":{"id":"1","guardName":"","optionalGuardDaysByDates":"08:00","finishHour":"09:00","TypeOfInfoPreference":"1","Comments":"","halfOrFull":"1","flexibilityByDays":[],"flexibilityByDates":[],"location":"","weekDaysOrDates":null},"sketches":[],"displaySetting":{"view":"preferences"},"SketchIdInEdit":"","pendingPreferenceIdInEdit":null,"currentSessionState":{"LocationGroupTabOpen":null,"SketchIdInEdit":null,"locationGroupInEdit":null,"preferenceIdInEdit":null,"pendingPreferenceIdInEdit":null,"dataHolderForCurrentPreferenceInEdit":null,"userName":"","isAnimationRunning":true},"LocationGroups":[],"daysBetweenGuardDuty":"7"},"timeStamp":"1643939110797","hash":"1118264981"}`
        return jsonString
    }

}
