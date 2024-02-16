import axios, { AxiosResponse } from "axios";
import path from "path";
import { appData, warehouseData } from "./db/data";
import { InventoryDto } from "./dto/inventory.dto";
import {
  SkuBatchToSkuId,
  skuBatchUpdate,
} from "./interfaces.util";

const logger = console;
export class InventoryApi {
  constructor(private apiBase?: string) {
    // use the apiBase if it's provided, otherwise use the environment variable
    if (!apiBase && !process.env.Inventory_API_BASE) {
      throw new Error('"INVENTORY_API_BASE" missing from environment');
    }
    // || should be unneeded, but the compiler doesn't see that the env var cannot be undefined at this point.
    this.apiBase ??= process.env.INVENTORY_API_BASE || "";
  }


  /**
   * Updates the inventory via the v1 API
   * @param idsToInsert
   * @returns A response from the inventory API
   */
  async insertInventoryBatch(idsToInsert: string[]): Promise<void> {
    idsToInsert
      .map((id: string) => {
        const batch = appData.find((r: SkuBatchToSkuId) => r.skuBatchId === id);
        if (!batch) {
          throw new Error(`no record found for skuBatchId ${id}`);
        }
        // return warehouseData.map(
        //   (warehouse: WMSWarehouseMeta): RecordWithWMS => ({
        //     skuBatchId: batch.skuBatchId,
        //     skuId: batch.skuId,
        //     wmsId: batch.wmsId,
        //     quantityPerUnitOfMeasure:
        //       batch.quantityPerUnitOfMeasure ?? 1,
        //     isArchived: batch.isArchived,
        //     isDeleted: batch.isDeleted,
        //     warehouseId: warehouse.warehouseId,
        //   })
        // );
        return {
          skuBatchId: batch.skuBatchId,
          skuId: batch.skuId,
        } as InventoryDto;
      })
      .flat()
      .forEach(async (r: InventoryDto) => {
        try {
          await axios.post(
            this.apiBase + "/inventory", //r.warehouseId ? "inventory" : "inventory-aggregate",
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
    inventoryUpdates: skuBatchUpdate[]
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
          updates: update.updates,
        } as InventoryDto;
      })
      .forEach(async (u: InventoryDto) => {
        try {
          await axios.post(
            this.apiBase + "/inventory-aggregate", // we will never have a warehouseId, since skuBatchUpdates don't have them
            JSON.stringify(u) //? Matt: should the updates be included? My gut says yes, but the spec doesn't mention them
          );
        } catch (err) {
          logger.error(err);
          throw err;
        }
      });
  }
}

export const inventoryApi = new InventoryApi();
