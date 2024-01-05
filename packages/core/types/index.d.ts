declare global {
  type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
}
