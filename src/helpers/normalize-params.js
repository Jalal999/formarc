export const normalizeParams = (...params) => {
  if (params.length === 0) return ''
  if (params[0] && !params[0].startsWith('?')) {
    params[0] = '?' + params[0]
  }
  if (params?.length === 1) return params[0]
  return params.join('&')
}
