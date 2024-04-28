export const normalizeNestedValues = (values) => {
    var updatedValues = values
    Object.keys(updatedValues).forEach(key => {
        const value = updatedValues[key]
        if(key.includes('.')) {
            const nestedValueName = key.split('.')[1]
            const parentValueName = key.split('.')[0]
            const nestedValue =  {
                [nestedValueName]: value
            }
            updatedValues[parentValueName] = nestedValue
            delete updatedValues[key]
        }
    })
    return updatedValues
}

export const customRequest = async (apiUrl, method, formValues, additionalParams) => {
    const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formValues,
          ...additionalParams,
        }),
    });
    return response
}

export const filterFormValues = (formValues, fields) => {
    const fieldsIgnoredForSave = convertToArray(fields).filter(
        (field) =>
          field.ignoreFor === 'edit' ||
          field.ignoreFor === 'save'
    )

    const keys = fieldsIgnoredForSave.map((field) => field.name)

    console.log('keys: ', keys)
    
    // TODO: nested olanlari filter elemir
    return Object.keys(formValues)
        .filter((key) => !keys.includes(key))
        .reduce((acc, key) => {
            acc[key] = formValues[key]
            return acc
        }, {})
}

export const convertToArray = (obj) => {
    if (!obj) {
        return []
    }
    if (Array.isArray(obj)) {
        return obj
    }

    return [obj]
}

export const formulateWithInitialValues = (formValues, fields) => {
    fields.map(field => {
        if(!formValues[field.name]) {
            formValues[field.name] = field.type === 'checkbox' ? false : ''
        }
    })
    return formValues
}