import {TextFieldPropertiesModel} from '../../models/text-field-properties.model';

import React from 'react';
import {Theme} from '@mui/system';
import {TextField} from '@mui/material';


const useStyles = (() => ({
    root: {
        direction: (theme: Theme) => theme.direction,
        '& .MuiFormLabel-root': {
            left: 'inherit'
        },
        '& .MuiInputBase-input': {
            // paddingTop: '10px',
            // paddingBottom: '10px'
        }
    }
}))
export const RenderTextField = (
    {
        input,
        label,
        meta: {
            touched,
            error
        },
        ...custom
    }: TextFieldPropertiesModel,
) => (
    <TextField variant={'standard'}
               dir={'ltr'}
               style={{
                   direction: 'ltr',

               }}
               label={label}
               sx={{
                   ...
                       useStyles()
                           .root,
                   width: '300px'
               }}
               onChange={input.onChange}
               {...input}
               {...custom}

    />
);
