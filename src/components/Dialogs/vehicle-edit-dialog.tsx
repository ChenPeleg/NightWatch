import * as React from 'react';
import {useRef, useState} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {translations} from '../../services/translations';
import {VehicleModel} from '../../models/Vehicle.model';
import {Box, ToggleButton, ToggleButtonGroup} from '@mui/material';
import {SxProps} from '@mui/system';
import {Delete} from '@mui/icons-material';

interface VehicleEditDialogProps {
    open: boolean;
    vehicleData: VehicleModel | null;
    onDelete: (id: string | null) => void;
    onClose: (vehicleUpdate: VehicleModel | null) => void;
}

export const VehicleEditDialog = (props: VehicleEditDialogProps) => {
    const {
        onClose,
        onDelete,
        open,
        vehicleData
    } = props;

    const [seatsValue, setSeatsValue] = useState(vehicleData?.seats || '5');
    const [didDialogJustClosed, setDidDialogJustClosed] = useState(false);

    if (didDialogJustClosed && open) {
        setSeatsValue(vehicleData?.seats || '5');

        setDidDialogJustClosed(false);
    }

    const nameValueRef: any = useRef('')
    const commentsValueRef: any = useRef('')
    const filedWrapper: SxProps = {width: '230px'}
    const handleCloseCancel = () => {
        onClose(null);
        setDidDialogJustClosed(true)
    };

    const handleCloseEdit = (): void => {
        let editedData: VehicleModel | null = null;
        if (vehicleData) {
            editedData = {...vehicleData};
            editedData.seats = seatsValue;
            editedData.vehicleName = nameValueRef?.current?.value || vehicleData?.vehicleName || '';
            editedData.Comments = commentsValueRef?.current?.value || vehicleData?.Comments || '';
        }

        onClose(editedData);
        setDidDialogJustClosed(true)
    };
    const handleCloseDelete = (): void => {
        onDelete(vehicleData?.id || '');
        setDidDialogJustClosed(true)
    };
    const handleSeatsValueChanged = (event: any, value: '7' | '5'): void => {

        setSeatsValue(value);

    }
    return (
        <div>

            <Dialog open={open} onClose={handleCloseCancel}>
                <DialogTitle> {vehicleData?.vehicleName}</DialogTitle>
                <DialogContent>
                    <Box sx={{...filedWrapper}}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="vehicle-rename-dialog-text-field"
                            label={translations.NewName}
                            type="text"

                            variant="standard"
                            defaultValue={vehicleData?.vehicleName}
                            inputRef={nameValueRef}
                            onKeyUp={(event) => {
                                if (event.key === 'Enter') {
                                    handleCloseEdit()
                                }
                            }}
                        />
                    </Box>
                    <Box sx={{...filedWrapper}}>
                        <TextField

                            margin="dense"
                            id="vehicle-comments-dialog-text-field"
                            label={translations.Comments}
                            type="text"
                            fullWidth
                            variant="standard"
                            defaultValue={vehicleData?.Comments}
                            inputRef={commentsValueRef}
                            onKeyUp={(event) => {
                                if (event.key === 'Enter') {
                                    handleCloseEdit()
                                }
                            }}
                        />
                    </Box>

                    <Box dir={'ltr'} sx={{

                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '1em',
                        display: 'flex'
                    }}>
                        <ToggleButtonGroup
                            color="primary"
                            // value={seatsValue}
                            // defaultValue={vehicleData?.seats || '5'}
                            exclusive
                            onChange={(event, value) => {

                                handleSeatsValueChanged(event, value)
                            }}

                        >
                            <ToggleButton selected={seatsValue === '7'} key={'7'} value="7"
                                          dir={'ltr'}>7 {translations.seats} </ToggleButton>
                            <ToggleButton selected={seatsValue === '5'} key={'5'} value="5"
                                          dir={'ltr'}>5 {translations.seats} </ToggleButton>

                        </ToggleButtonGroup>
                    </Box>
                    <Box sx={{

                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '1em',
                        display: 'flex'
                    }}>
                        {(vehicleData?.id !== '0') ? (
                            <Button variant="contained" onClick={handleCloseDelete} aria-label="add" size="large">
                                <Delete/> {translations.Delete}
                            </Button>) : null}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button id={'vehicle-edit-cancel-button'} onClick={handleCloseCancel}>{translations.Cancel}</Button>
                    <Button id={'vehicle-edit-approve-button'} onClick={handleCloseEdit}>{translations.Approve}</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
