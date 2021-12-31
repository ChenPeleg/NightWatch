import {FileUploadType, IAction, SaveDataModel, ShmiraListStore} from './store.types';
import {StoreUtils} from './store-utils';
import {DownloadFile} from '../services/download-file';
import {Utils} from '../services/utils';
import {ActionsTypes} from './types.actions';
import {ImportOrdersFromText} from '../services/import-orders-from-text';
import {OrderModel} from '../models/Order.model';

export type ImportReducerFunctions =
    ActionsTypes.EXPORT_ALL |
    ActionsTypes.IMPORT_FILE_UPLOADED |
    ActionsTypes.IMPORT_ORDERS_AS_TEXT

export const ImportExportReducer: Record<ImportReducerFunctions, (state: ShmiraListStore, action: IAction) => ShmiraListStore> = {
    [ActionsTypes.EXPORT_ALL]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}
        newState.shmiraListCollection = StoreUtils.UpdateShmiraListCollectionWithCurrenShmiraList(newState);
        const saveObj: SaveDataModel = StoreUtils.buildSaveDataModel(newState)
        DownloadFile('shmiraList.json', JSON.stringify(saveObj))
        return newState

    },
    [ActionsTypes.IMPORT_FILE_UPLOADED]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}
        const uploadType: FileUploadType = action.payload.uploadType;
        const fileAsString: string = action.payload.fileAsString;
        try {
            const fileObj: any = JSON.parse(fileAsString);
            if (fileObj && fileObj?.savedStore && fileObj?.hash) {
                Utils.validateHash(fileObj?.savedStore, fileObj?.hash);
                const storeFromFile = {
                    ...fileObj
                        .savedStore
                }
                switch (uploadType) {
                    case FileUploadType.uploadFullDataAndAdd:
                        newState = storeFromFile
                        break;
                }

            }

        } catch (e) {

        } finally {

        }
        return newState


    },
    [ActionsTypes.IMPORT_ORDERS_AS_TEXT]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}
        const importedOrders: string = action.payload.importedOrders;
        const modeledImportedOrders: OrderModel[] = ImportOrdersFromText(importedOrders);
        newState.orders = newState.orders.concat(modeledImportedOrders)
        // try {
        //
        //
        // } catch (e) {
        //
        // } finally {
        //
        // }
        return newState


    },


}
