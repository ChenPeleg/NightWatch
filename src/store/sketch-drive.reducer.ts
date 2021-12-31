import {ActionsTypes} from './types.actions';


import {IAction, ShmiraListRecord, ShmiraListStore} from './store.types';
import {DriveModel, SketchModel, VehicleScheduleModel} from '../models/Sketch.model';
import {CloneUtil} from '../services/clone-utility';
import {OrderModel} from '../models/Order.model';
import {StoreUtils} from './store-utils';

export type SketchDriveReducerFunctions = ActionsTypes.DELETE_SKETCH_DRIVE
                                          | ActionsTypes.UPDATE_SKETCH_DRIVE | ActionsTypes.REMOVE_ORDER_FROM_SKETCH_DRIVE


export const SketchDriveReducer: Record<SketchDriveReducerFunctions, (state: ShmiraListStore, action: IAction) => ShmiraListStore> = {

    [ActionsTypes.UPDATE_SKETCH_DRIVE]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}
        const sketchDriveChanged: DriveModel = action.payload.value
        const SketchIdInEdit = newState.SketchIdInEdit;

        const sketchObj: SketchModel | undefined = newState.sketches.find((record: SketchModel) => record.id === SketchIdInEdit);

        if (sketchObj !== undefined) {
            const vehicleId = getVehicleIdFromDriveId(state, sketchDriveChanged.id);
            const relevantVehicle = sketchObj.vehicleSchedules.find(v => v.id === vehicleId);
            if (relevantVehicle) {
                relevantVehicle.drives = relevantVehicle.drives.map((d: DriveModel) => {
                    if (d.id === sketchDriveChanged.id) {
                        return sketchDriveChanged
                    } else {
                        return d
                    }
                })
            }


        }
        return newState

    },

    [ActionsTypes.REMOVE_ORDER_FROM_SKETCH_DRIVE]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}

        const sketchDriveChangedId: string = action.payload.sketchDriveId
        const orderIdToRemove: string = action.payload.orderId
        const SketchIdInEdit = newState.SketchIdInEdit;


        const sketchObj: SketchModel | undefined = newState.sketches.find((record: SketchModel) => record.id === SketchIdInEdit);

        if (sketchObj !== undefined) {
            const vehicleId = getVehicleIdFromDriveId(state, sketchDriveChangedId);
            const relevantVehicle = sketchObj.vehicleSchedules.find(v => v.id === vehicleId);
            if (relevantVehicle) {
                relevantVehicle.drives = relevantVehicle.drives.map((d: DriveModel) => {
                    if (d.id === sketchDriveChangedId) {
                        const newDrive = {...d};
                        newDrive.implementsOrders = (newDrive.implementsOrders).filter(ord => ord !== orderIdToRemove)

                        return newDrive
                    } else {
                        return d
                    }
                })
            }
            let OrderToMoveToUnassinged: OrderModel | undefined = sketchObj.assignedOrders.find(o => o.id === orderIdToRemove);
            if (OrderToMoveToUnassinged) {
                sketchObj.assignedOrders = sketchObj.assignedOrders.filter(o => o.id !== orderIdToRemove);
                sketchObj.unassignedOrders = [...sketchObj.unassignedOrders];
                sketchObj.unassignedOrders.push(OrderToMoveToUnassinged);


            }


        }
        StoreUtils.updateShmiraListRecordWithSketchChanges(newState)
        return newState

    },
    [ActionsTypes.DELETE_SKETCH_DRIVE]: (state: ShmiraListStore, action: IAction): ShmiraListStore => {
        let newState = {...state}
        const sketchDriveToDelete: DriveModel = action.payload.value
        const SketchIdInEdit = newState.SketchIdInEdit;

        const sketchObj: SketchModel | undefined = newState.sketches.find((record: SketchModel) => record.id === SketchIdInEdit);

        if (sketchObj !== undefined) {
            const vehicleId = getVehicleIdFromDriveId(state, sketchDriveToDelete.id);
            const relevantVehicle = sketchObj.vehicleSchedules.find(v => v.id === vehicleId);
            if (relevantVehicle) {

                const newDrives: (DriveModel | null) [] = relevantVehicle.drives.map((d: DriveModel) => {
                    if (d.id === sketchDriveToDelete.id) {
                        return null
                    } else {
                        return d
                    }
                });
                relevantVehicle.drives = newDrives.filter(d => d) as DriveModel[]
            }


        }
        StoreUtils.updateShmiraListRecordWithSketchChanges(newState)
        return newState

    },


}
const updateShmiraListRecordWithSketchChanges = (state: ShmiraListStore): ShmiraListStore => {
    const newState = {...state};
    const thisShmiraListInCollection: ShmiraListRecord | undefined = newState.shmiraListCollection.find((shmiraList: ShmiraListRecord) => shmiraList.id === newState.shmiraListId);


    if (thisShmiraListInCollection) {
        thisShmiraListInCollection.sketches = newState.sketches.map(s => CloneUtil.deepCloneSketch(s))
    }

    return newState

}


const getVehicleIdFromDriveId = (state: ShmiraListStore, driveId: string): string => {
    const SketchIdInEdit = state.SketchIdInEdit
    const sketchObj: SketchModel | undefined = state.sketches.find((record: SketchModel) => record.id === SketchIdInEdit);
    const vehicleSchedules = sketchObj?.vehicleSchedules || [];
    let vehicleId = '';
    vehicleSchedules.forEach((v: VehicleScheduleModel) => {
        v.drives.forEach((d: DriveModel) => {
            if (d.id === driveId) {
                vehicleId = v.id
            }

        })
    })
    return vehicleId

}
