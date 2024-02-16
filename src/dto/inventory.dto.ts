import { RecordWithWMS, inventoryUpdate } from 'src/interfaces.util';

type InventoryInsertData = {
  record: {
    wmsId: number;
    quantityPerUnitOfMeasure: number;
    isArchived: boolean;
    isDeleted: boolean;
  };
}

type InventoryUpdateData = {
  updates: inventoryUpdate[];
}

type InventoryWarehouseDto = {
  skuBatchId: string;
  skuId: string;
  warehouseId: string;
}

type InventoryAggregateDto = {
  skuBatchId: string;
  skuId: string;
}

export type InventoryDto =
  | InventoryInsertData & InventoryWarehouseDto
  | InventoryInsertData & InventoryAggregateDto
  | InventoryUpdateData & InventoryWarehouseDto
  | InventoryUpdateData & InventoryAggregateDto;