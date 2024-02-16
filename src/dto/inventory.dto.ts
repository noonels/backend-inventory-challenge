import { inventoryUpdate } from 'src/interfaces.util';

export type InventoryDto = {
  skuBatchId: string;
  skuId: string;
  warehouseId?: string;
  updates?: inventoryUpdate[];
}
