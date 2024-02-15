import axios, { AxiosResponse } from "axios";
import path from "path";
import { appData } from "./db/data";
import { InventoryDto } from "./dto/inventory.dto";
import {
  SkuBatchToSkuId,
  skuBatchUpdate,
} from "./interfaces.util";

const logger = console;

/**
 * Updates the inventory via the v1 API
 * @param idsToInsert
 * @returns A response from the inventory API
 */
export async function insertInventoryBatch(
  idsToInsert: string[]
): Promise<void> {
  const apiBase = process.env.INVENTORY_API_BASE;
  if (!apiBase) {
    throw new Error('"INVENTORY_API_BASE" missing from environment');
  }

  idsToInsert
    .map((id: string) => {
      const batch = appData.find((r: SkuBatchToSkuId) => r.skuBatchId === id);
      if (!batch) {
        throw new Error(`no record found for skuBatchId ${id}`);
      }
      return batch;
    })
    .forEach(async (r: InventoryDto) => {
      try {
        await axios.post(
          path.join(apiBase, r.warehouseId ? "inventory" : "inventory-aggregate"),
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
export async function updateInventoryBatch(
  inventoryUpdates: skuBatchUpdate[]
): Promise<void> {
  const apiBase = process.env.INVENTORY_API_BASE;
  if (!apiBase) {
    throw new Error('"INVENTORY_API_BASE" missing from environment');
  }

  inventoryUpdates
    .map((update: skuBatchUpdate) => {
      const batch = appData.find((r: SkuBatchToSkuId) => r.skuBatchId === update.skuBatchId);
      if (!batch) {
        throw new Error(`no record found for skuBatchId ${update.skuBatchId}`);
      }
      return batch;
    })
    .forEach(async (r: InventoryDto) => {
      try {
        await axios.post(
          path.join(apiBase, "inventory-aggregate"), // we will never have a warehouseId, since skuBatchUpdates don't have them
          JSON.stringify(r) //? Matt: should the updates be included? My gut says yes, but the spec doesn't mention them
        );
      } catch (err) {
        logger.error(err);
        throw err;
      }
    });
}