export interface IResponseWithPagination<TItem> {
    items: TItem[],
    hasMore: boolean,
    page: number,
    itemsPerPage: number,
}
