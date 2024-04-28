import React, { useEffect, useState } from 'react';
import { FORM_TYPE, FORM_ELEMENT_TYPE } from './constants';
import { normalizeParams } from './helpers/normalize-params';
import { normalizeNestedValues, filterFormValues, customRequest, formulateWithInitialValues } from './helpers/utils';
import { useFormarc } from './useFormarc';
// TODO: add validate type prop to Podarc(partially done : validateOnBlur is left)
// TODO: custom request-i update etmek lazimdir. GET uchun ferqlidir biraz.

const Formarc = ({
  type = 'save',
  inputs, 
  validators,
  initialFormValues,
  validateOnChange = true,
  validateOnSubmit = false,
  validateOnBlur = false,
  onSubmit,
  apiEndpoint,
  additionalParams,
  className,
  style,
  inputClassName,
  selectClassName,
  submitClassName,
 }) => {
  const [validationType, setValidationType] = useState('onChange')
  const {
    formValues,
    setFormValues,
    handleChange,
    handleDisabledFieldChange,
    handleCheckboxCheck,
    validateForm,
    errorMessages
  } = useFormarc(initialFormValues, validators, validationType)

  // useEffect(() => {
  //   setFormValues(normalizeNestedValues(formValues))
  // }, [formValues])

  useEffect(() => {
    // if same field is given two different values(one from value property, one from initialFormValues), it will take value property for disabled input fields
    inputs.map(field => {
      if(field.value) {
        initialFormValues[field.name] = field.value
      }
    })
    setFormValues(initialFormValues)
  }, [])

  useEffect(() => {
    setValidationType(validateOnSubmit ? 'onSubmit' : validateOnBlur ? 'onBlur' : 'onChange')
  }, [validateOnSubmit, validateOnBlur])

  const getValueToShowInField = (field) => {
    if(field.disabled) {
      return field.value
    }
    return formValues[field.name]
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let apiUrl;
    if(additionalParams) {
      const params = normalizeParams(additionalParams.params)
      apiUrl = `${apiEndpoint}${params !== undefined ? params : ''}`
    }

    const method =
      type === 'save' ? 'POST' :        // If type is 'save', method is 'POST' to create new record
      type === 'edit' ? 'PATCH' :       // If type is 'edit', method is 'PATCH' to update partially
      type === 'update' ? 'PUT' :       // If type is 'update', method is 'PUT' to update whole
      'GET';                            // For any other value of type(meaning 'view'), method is 'GET'

    try {
      setFormValues(formulateWithInitialValues(formValues, inputs))
      const payload = filterFormValues(formValues, inputs)

      if(validationType === 'onSubmit') {
        validateForm(payload, validators)
      }

      const normalizedNestedPayload = normalizeNestedValues({...payload})

      // add conditional check - if there is error message - request should NOT be sent
      const response = customRequest(apiUrl, method, normalizedNestedPayload, additionalParams)
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      // Handle successful form submission
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error
    }
  };

  return (
    <form className={className} style={style} onSubmit={handleSubmit}>
      {inputs.map((field, index) => {
        // Check if the field should be ignored for the current action
        if (field.ignoreFor && field.ignoreFor.includes('save')) {
          return null; // Skip rendering the field
        }

        if(type === FORM_TYPE.VIEW) {
          field.disabled = true
        }

        if(field.display === 'nested') {
          if(!field.name.includes('.')) { // for display: nested, the naming should be with '.'. Ex.: user.name
            throw Error("Naming for nested item is not corret...")
          }
        } else if(field.name.includes('.') && field.display !== 'nested') {
            throw Error("Item should be nested to take such naming...")
        }

        if (field.disabled) {
          if(!formValues[field.name] && !initialFormValues[field.name]) {
            handleDisabledFieldChange(field, field.value || ''); // Assuming field.value exists
          }
          // If the field is disabled and no value is set, set the value
        }
        const isVisible = typeof field.visibleIf === 'function' ? field.visibleIf(normalizeNestedValues({...formValues})) : true

        if(type !== FORM_TYPE.VIEW) {
          if(field.disabled) {
            if(field.display === 'nested' && 
              (!field.value && !initialFormValues[field.name] && !formValues[field.name])) 
            {
              throw Error(`${field.name} Disabled field should have a given valuee...`)
            }
          }
        } else {
          if(field.disabled && (!field.value && !initialFormValues[field.name]) && !formValues[field.name]) {
            return null; //skip rendering the fields which don't have value for the VIEW type - either in initialValues or in formValues they should have value to show in VIEW mode of form
          }
        }

        if(isVisible) {
          let input
          switch (field.type) {
            case FORM_ELEMENT_TYPE.TEXT:
              input = (
                <div key={index}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    required={field.required}
                    className={`podarc-input ${inputClassName}`}
                    value={getValueToShowInField(field) || '' || field.value}
                    onChange={handleChange}
                    disabled={field.disabled}
                  />
                  <span>{errorMessages[field.name]}</span>
                </div> 
              )
              break
            case FORM_ELEMENT_TYPE.SELECTBOX:
              const options = field.dependency ? field.dependency[formValues[field.dependency.key]] || [] : field.items;

              input = (
                <div key={index}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <select
                    name={field.name}
                    required={field.required}
                    className={`podarc-select ${selectClassName}`}
                    value={getValueToShowInField(field) || '' || field.value}
                    // value={formValues[field.name] || '' || field.value}
                    onChange={handleChange}
                    disabled={field.disabled}
                  >
                    {options.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              )
              break
            case FORM_ELEMENT_TYPE.CHECKBOX:
              input = (
                <div key={index}>
                  <input
                    type="checkbox"
                    name={field.name}
                    required={field.required}
                    className={`podarc-input ${inputClassName}`}
                    value={getValueToShowInField(field) || false || field.value}
                    onChange={handleCheckboxCheck}
                    disabled={field.disabled}
                  />
                  <label htmlFor={field.name}>{field.label}</label>
                  <span>{errorMessages[field.name]}</span>
                </div> 
              )
              break
            case FORM_ELEMENT_TYPE.DATE:
              input = (
                <div key={index}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <input
                    type="date"
                    name={field.name}
                    required={field.required}
                    className={`podarc-input ${inputClassName}`}
                    value={getValueToShowInField(field) || '' || field.value}
                    onChange={handleChange}
                    disabled={field.disabled}
                  />
                  <span>{errorMessages[field.name]}</span>
                </div> 
              )
              break
          }
          return (
            <>{input}</>
          )
        }
        return null;
      })}
      <button type="submit" className={`podarc-submit ${submitClassName}`}>Submit</button>
    </form>
  );
};

export default Formarc;
