import axios from "axios";
import { appData } from "./db/data";
import { InventoryDto } from "./dto/inventory.dto";
import {
  SkuBatchToSkuId,
  skuBatchUpdate,
} from "./interfaces.util";

const logger = console;
export class InventoryApi {
  constructor(private apiBase: string) { }


  /**
   * Updates the inventory via the v1 API
   * @param idsToInsert
   * @returns A response from the inventory API
   */
  async insertInventoryBatch(idsToInsert: string[], warehouseId?: string): Promise<void> {
    idsToInsert
      .map((id: string) => {
        const batch = appData.find((r: SkuBatchToSkuId) => r.skuBatchId === id);
        if (!batch) {
          throw new Error(`no record found for skuBatchId ${id}`);
        }
        return {
          skuBatchId: batch.skuBatchId,
          skuId: batch.skuId,
          ...(warehouseId ? { warehouseId } : {}),
          record: {
            wmsId: batch.wmsId,
            quantityPerUnitOfMeasure: batch.quantityPerUnitOfMeasure ?? 1,
            isArchived: batch.isArchived,
            isDeleted: batch.isDeleted,
          },
        } as InventoryDto;
      })
      .flat()
      .forEach(async (r: InventoryDto) => {
        const endpoint = "warehouseId" in r ? "inventory" : "inventory-aggregate";
        try {
          await axios.post(
            this.apiBase + "/" + endpoint,
            JSON.stringify(r)
          );
        } catch (err) {
          logger.error(err);
          throw err;
        }
      });
  }

  /**
   * Updates the inventory via the v1 API
   * @param idsToInsert
   * @returns A response from the inventory API
   */
  async updateInventoryBatch(
    inventoryUpdates: skuBatchUpdate[],
    warehouseId?: string,
  ): Promise<void> {
    inventoryUpdates
      .map((update: skuBatchUpdate) => {
        const batch = appData.find(
          (r: SkuBatchToSkuId) => r.skuBatchId === update.skuBatchId
        );
        if (!batch) {
          throw new Error(
            `no record found for skuBatchId ${update.skuBatchId}`
          );
        }
        return {
          skuBatchId: batch.skuBatchId,
          skuId: batch.skuId,
          ...(warehouseId ? { warehouseId } : {}),
          updates: update.updates,
        } as InventoryDto;
      })
      .forEach(async (body: InventoryDto) => {
        const endpoint = "warehouseId" in body ? "inventory" : "inventory-aggregate";
        try {
          await axios.post(
            this.apiBase + "/" + endpoint,
            JSON.stringify(body)
          );
        } catch (err) {
          logger.error(err);
          throw err;
        }
      });
  }
}

export const inventoryApi = new InventoryApi(process.env.INVENTORY_API_BASE || "");
