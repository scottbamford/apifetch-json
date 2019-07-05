/**
 * Function that can be used instead of a static object to compile RequestInit after mergeing any previous RequestInit's together.
 */
export type RequestInitFunction = (init: RequestInit) => RequestInit;