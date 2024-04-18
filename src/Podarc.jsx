import React, { useEffect, useState } from 'react';
import { FORM_TYPE, FORM_ELEMENT_TYPE } from './constants';
import { normalizeParams } from './helpers/normalize-params';
import { normalizeNestedValues } from './helpers/utils';

// TODO: add type feature to validators property to define showing error messages during onChange or after submit (can be another prop for Podarc: validateOnChange, validateOnSubmit as in formarc)
// TODO: move setting error messages can be moved to redux/context - think which one is efficient
// TODO: add ignoreFor = 'patch' implementation to filter that field for saving/editing 


const Podarc = ({ type = 'save', inputs, validators, initialFormValues, className, style, inputClassName, selectClassName, submitClassName, onSubmit, apiEndpoint, additionalParams }) => {
  const [formValues, setFormValues] = useState(normalizeNestedValues(initialFormValues))
  const [errorMessages, setErrorMessages] = useState({})

  // useEffect(() => {
  //   setFormValues(normalizeNestedValues(formValues))
  // }, [formValues])

  useEffect(() => {
    // if same field is given two different value(one from value property, one from initialFormValues), it will take value property for disabled input fields
    inputs.map(field => {
      if(field.value) {
        if(field.name.includes('')) {
          initialFormValues[field.name.split('.')[0]][field.name.split('.')[1]] = field.value
        } else {
          initialFormValues[field.name] = field.value
        }
      }
    })
    setFormValues(normalizeNestedValues(initialFormValues))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target;
    // let changingData;
    if(name.includes('.')) {
      // there is problem for display: nested fields ('user.name')
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

  const handleFormValuesForDisabledField = (field, value) => {
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

  const getValueToShowInField = (field) => {
    if(field.disabled) {
      return field.value
    } else if(field.display === 'nested') {
        return formValues[field.name.split('.')[0]][field.name.split('.')[1]]
    }
    return formValues[field.name]
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    let apiUrl;
    if(additionalParams) {
      const params = normalizeParams(additionalParams.params)
      apiUrl = `${apiEndpoint}${params !== undefined ? params : ''}`
    }
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formValues,
          ...additionalParams,
        }),
      });
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
          if(field.display === 'nested') {
            if(!formValues[field.name.split('.')[0]][field.name.split('.')[1]] && !initialFormValues[field.name]) {
              handleFormValuesForDisabledField(field, field.value || ''); // Assuming field.value exists
            }
          } else {
            if(!formValues[field.name] && !initialFormValues[field.name]) {
              handleFormValuesForDisabledField(field, field.value || ''); // Assuming field.value exists
            }
          }
          // If the field is disabled and no value is set, set the value
        }

        const isVisible = typeof field.visibleIf === 'function' ? field.visibleIf(formValues) : true

        if(type !== FORM_TYPE.VIEW) {
          if(field.disabled) {
            if(field.display === 'nested' && 
              (!formValues[field.name.split('.')[0]][field.name.split('.')[1]] 
              && !initialFormValues[field.name] && !field.value
              ) || (!field.value && !initialFormValues[field.name] && !formValues[field.name])) 
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
          if (field.type === FORM_ELEMENT_TYPE.TEXT) {
            return (
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
            );
          } else if (field.type === FORM_ELEMENT_TYPE.SELECTBOX) {
            const options = field.dependency ? field.dependency[formValues[field.dependency.key]] || [] : field.items;
  
            return (
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
            );
          }
        }
        return null;
      })}
      <button type="submit" className={`podarc-submit ${submitClassName}`}>Submit</button>
    </form>
  );
};

export default Podarc;
