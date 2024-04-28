import React, { useEffect, useState, useCallback } from 'react';
import { normalizeNestedValues } from './helpers/utils';

export const useFormarc = (initialFormValues = {}, validators, validationType) => {
    const [formValues, setFormValues] = useState(initialFormValues)
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
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value
      }));
      if(validationType === 'onChange') validateField(e)
    };

    const handleCheckboxCheck = (e) => {
      const { name } = e.target;
      const value = e.target.checked
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value
      }));
      if(validationType === 'onChange') validateField(e)
    }

    const handleDisabledFieldChange = (field, value) => {
      setFormValues((prevValues) => ({
        ...prevValues,
        [field.name]: value,
      }));
    }

    const validateField = (e) => {
        const { name, value } = e.target;
        const checkboxValue = e.target?.checked

        validators.map(validation => {
        if(validation.name === name) {
          if(validation.min && value < validation.min.value) {
            setErrorMessages((prevValues) => ({
              ...prevValues,
              [name]: validation.min.error,
              }));
          } else if(validation.max && value > validation.max.value) {
            setErrorMessages((prevValues) => ({
              ...prevValues,
              [name]: validation.max.error,
              }));
          } else if(validation.minLength && value.length < validation.minLength.value) {
            setErrorMessages((prevValues) => ({
              ...prevValues,
              [name]: validation.minLength.error,
            }));
          } else if(validation.maxLength && value.length > validation.maxLength.value) {
            setErrorMessages((prevValues) => ({
              ...prevValues,
              [name]: validation.maxLength.error,
            }));
          } else if(validation.required && !checkboxValue) {
            setErrorMessages((prevValues) => ({
              ...prevValues,
              [name]: validation.required,
            }));
          } else {
              setErrorMessages((prevValues) => ({
                ...prevValues,
                [name]: '',
              }));
            }
         }
        })
    }

    const validateForm = (payload, validators) => {
      console.log('payload: ', payload)
      Object.entries(payload).forEach(([key, value]) => {
        console.log('key: ', key, ' values: ', value)
        validators.map(validation => {
          if(validation.name === key) {
            if(validation.min && value < validation.min.value) {
              setErrorMessages((prevValues) => ({
                ...prevValues,
                [key]: validation.min.error,
                }));
            } else if(validation.max && value > validation.max.value) {
              setErrorMessages((prevValues) => ({
                ...prevValues,
                [key]: validation.max.error,
                }));
            } else if(validation.minLength && value.length < validation.minLength.value) {
              setErrorMessages((prevValues) => ({
                ...prevValues,
                [key]: validation.minLength.error,
              }));
            } else if(validation.maxLength && value.length > validation.maxLength.value) {
              setErrorMessages((prevValues) => ({
                ...prevValues,
                [key]: validation.maxLength.error,
              }));
            } else if(validation.required && !value) {
              setErrorMessages((prevValues) => ({
                ...prevValues,
                [key]: validation.required,
              }));
            } else {
                setErrorMessages((prevValues) => ({
                  ...prevValues,
                  [key]: '',
                }));
              }
           }
          })
      });
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
        handleCheckboxCheck,
        validateForm,
        // save,
        errorMessages
    }
}
