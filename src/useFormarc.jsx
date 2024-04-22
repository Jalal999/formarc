import React, { useEffect, useState, useCallback } from 'react';
import { normalizeNestedValues } from './helpers/utils';

export const useFormarc = (initialFormValues = {}, validators) => {
    const [formValues, setFormValues] = useState(normalizeNestedValues(initialFormValues))
    const [errorMessages, setErrorMessages] = useState({})

    // useEffect(() => {
    //     // if same field is given two different values(one from value property, one from initialFormValues), it will take value property for disabled input fields
    //     inputs.map(field => {
    //       if(field.value) {
    //         if(field.name.includes('.')) {
    //           initialFormValues[field.name.split('.')[0]][field.name.split('.')[1]] = field.value
    //         } else {
    //           initialFormValues[field.name] = field.value
    //         }
    //       }
    //     })
    //     setFormValues(normalizeNestedValues(initialFormValues))
    // }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;
        // let changingData;
        if(name.includes('.')) {
          setFormValues((prevValues) => ({
            ...prevValues,
            [name.split('.')[0]]: {
              [name.split('.')[1]]: value
            },
          }));
        } else {
          setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value
          }));
        }
        setErrorMessageForField(e)
    };

    const handleDisabledFieldChange = (field, value) => {
        if(field.name.includes('.')) {
          setFormValues((prevValues) => ({
            ...prevValues,
            [field.name.split('.')[0]]: {
              ...prevValues[field.name.split('.')[0]],
              [field.name.split('.')[1]]: value
            },
          }));
        } else {
          setFormValues((prevValues) => ({
            ...prevValues,
            [field.name]: value,
          }));
        }
    }

    // error messages for fields are being set during the onChange. check ToDo to set it during the submit as well
    const setErrorMessageForField = (e) => {
        const { name, value } = e.target;
        validators.map(validation => {
        if(validation.name === name && !validation.validator(value)) {
            setErrorMessages((prevValues) => ({
            ...prevValues,
            [name]: validation.errorMessage,
            }));
        } else {
            setErrorMessages((prevValues) => ({
            ...prevValues,
            [name]: '',
            }));
        }
        })
    }

    // const save = useCallback(
    //     async (params = {}) => {
    //       try {
    //         if (actionProps?.save?.method === 'patch') {
    //           const fieldsIncludedForPatch = ArrayUtils.toArray(fields).filter(
    //             (field) => field.includeFor?.includes('patch')
    //           )
    
    //           const id = formValues.id
    //           const payload =
    //             fieldsIncludedForPatch.length > 0
    //               ? ObjectUtils.pick(
    //                   formValues,
    //                   fieldsIncludedForPatch.map((field) => field.name)
    //                 )
    //               : formValues
    
    //           return handleSave(() => service.patch(payload, id))
    //         }
    
    //         const fieldsIgnoredForSave = ArrayUtils.toArray(fields).filter(
    //           (field) =>
    //             field.ignoreFor?.includes('edit') ||
    //             field.ignoreFor?.includes('create')
    //         )
    
    //         const payload =
    //           fieldsIgnoredForSave.length > 0
    //             ? ObjectUtils.omit(
    //                 formValues,
    //                 fieldsIgnoredForSave.map((field) => field.name)
    //               )
    //             : formValues
    
    //         return handleSave(() => service.createOrUpdate({...payload, ...params}))
    //       } catch (error) {
    //         console.error(`Error while saving the ${entityName} data: ${error}`)
    //         if (typeof actionProps?.save?.onRejected === 'function') {
    //           actionProps.save.onRejected(error)
    //         }
    //       }
    //     },
    //     [service, formValues]
    //   )

    return {
        formValues, 
        setFormValues, 
        handleChange, 
        handleDisabledFieldChange,
        // save,
        errorMessages
    }
}
