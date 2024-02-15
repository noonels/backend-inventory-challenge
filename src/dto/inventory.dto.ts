import { inventoryUpdate } from 'src/interfaces.util';

export interface InventoryDto {
  skuBatchId: string;
  skuId: string;
  warehouseId?: string;
  updates?: inventoryUpdate[];
}
