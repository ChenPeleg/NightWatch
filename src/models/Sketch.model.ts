import {PreferenceType} from './PreferenceType.enum';
import {PreferenceModel} from './Preference.model';

export interface DriveModel extends PreferenceModel {
    id: string,
    guardName: string,
    optionalGuardDaysByDates: string,
    finishHour: string,
    TypeOfDrivePreference: PreferenceType | null,
    location: string,
    Comments: string,
    halfOrFull: string,
    flexibilityByDays: string [],
    flexibilityByDates: string [],
    /**
     * @summary more properties that were not in the original drive
     */
    implementsPreferences: string [],
    description: string,
    
}

export interface VehicleScheduleModel {
    id: string
    VehicleId: string,
    drives: DriveModel[],
    Comments: string
}

export interface SketchModel {
    id: string,
    name: string,
    vehicleSchedules: VehicleScheduleModel[],
    unassignedPreferences: PreferenceModel[],
    assignedPreferences: PreferenceModel[],
    Comments: string,
    suggestions?: any,
}