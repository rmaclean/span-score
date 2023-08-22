export type Result<T> = SuccessResult<T> | FailureResult

export interface SuccessResult<T>{
  ok: true,
  data: T,
}

export interface FailureResult { ok: false, error: string }
