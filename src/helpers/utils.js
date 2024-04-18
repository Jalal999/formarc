export const normalizeNestedValues = (values) => {
    Object.keys(values).forEach(key => {
        const value = values[key]
        if(key.includes('.')) {
            const nestedValueName = key.split('.')[1]
            const parentValueName = key.split('.')[0]
            const nestedValue =  {
                [nestedValueName]: value
            }
            values[parentValueName] = nestedValue
            delete values[key]
        }
    })
    return values
}
