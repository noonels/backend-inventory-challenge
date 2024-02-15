import axios from "axios";
import path from "path";
import { insertInventoryBatch, updateInventoryBatch } from "./api.util";
import { skuBatchUpdate, SkuBatchToSkuId } from "./interfaces.util";
import { InventoryDto } from "./dto/inventory.dto";

jest.mock("axios");

describe("insertInventoryBatch", () => {
  const mockApiBase = "http://example.com/api";
  const mockIdsToInsert: string[] = ["sku-batch-id-1", "sku-batch-id-2"];

  beforeEach(() => {
    process.env.INVENTORY_API_BASE = mockApiBase;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.INVENTORY_API_BASE;
  });

  it('should throw an error if "INVENTORY_API_BASE" is missing from environment', async () => {
    delete process.env.INVENTORY_API_BASE;

    await expect(insertInventoryBatch(mockIdsToInsert)).rejects.toThrow(
      '"INVENTORY_API_BASE" missing from environment'
    );
  });

  it("should make API requests to insert inventory", async () => {
    const mockInventoryDto1: InventoryDto = {
      skuBatchId: "sku-batch-id-1",
      skuId: "sku-id-1",
    };

    const mockInventoryDto2: InventoryDto = {
      skuBatchId: "sku-batch-id-2",
      skuId: "sku-id-2",
    };

    // Mock the axios.post method to return a resolved promise
    (axios.post as jest.Mock).mockResolvedValueOnce({});

    await insertInventoryBatch(mockIdsToInsert);

    expect(axios.post).toHaveBeenCalledTimes(mockIdsToInsert.length);
    expect(axios.post).toHaveBeenCalledWith(
      "http://example.com/api/inventory",
      JSON.stringify(mockInventoryDto1)
    );
    expect(axios.post).toHaveBeenCalledWith(
      "http://example.com/api/inventory",
      JSON.stringify(mockInventoryDto2)
    );
  });

  it("should throw an error if no record is found for a skuBatchId", async () => {
    const mockInvalidIdsToInsert: string[] = ["sku-batch-id-fake"];

    await expect(insertInventoryBatch(mockInvalidIdsToInsert)).rejects.toThrow(
      "no record found for skuBatchId sku-batch-id-fake"
    );
  });
});

describe("updateInventoryBatch", () => {
  const mockApiBase = "http://example.com/api";
  const mockInventoryUpdates: skuBatchUpdate[] = [
    {
      skuBatchId: "sku-batch-id-1",
      updates: [
        {
          field: "quantityPerUnitOfMeasure",
          newValue: 5,
        },
        {
          field: "skuId",
          newValue: "1",
        },
      ],
    },
    // Add more mock inventory updates as needed
  ];

  beforeEach(() => {
    process.env.INVENTORY_API_BASE = mockApiBase;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.INVENTORY_API_BASE;
  });

  it('should throw an error if "INVENTORY_API_BASE" is missing from environment', async () => {
    delete process.env.INVENTORY_API_BASE;

    await expect(updateInventoryBatch(mockInventoryUpdates)).rejects.toThrow(
      '"INVENTORY_API_BASE" missing from environment'
    );
  });

  it("should make API requests to update inventory", async () => {
    const mockInventoryDto: InventoryDto = {
      skuBatchId: "sku-batch-id-1",
      skuId: "sku-id-1",
      updates: [
        {
          field: "quantityPerUnitOfMeasure",
          newValue: 5,
        },
        {
          field: "skuId",
          newValue: "1",
        },
      ],
    };

    // Mock the axios.post method to return a resolved promise
    (axios.post as jest.Mock).mockResolvedValueOnce({});

    await updateInventoryBatch(mockInventoryUpdates);

    expect(axios.post).toHaveBeenCalledTimes(mockInventoryUpdates.length);
    expect(axios.post).toHaveBeenCalledWith(
      "http://example.com/api/inventory-aggregate",
      JSON.stringify(mockInventoryDto)
    );
  });

  it("should throw an error if no record is found for a skuBatchId", async () => {
    const mockInvalidInventoryUpdates: skuBatchUpdate[] = [
      {
        skuBatchId: "2", // Invalid skuBatchId
        updates: [
          {
            field: "quantityPerUnitOfMeasure",
            newValue: 5,
          },
          {
            field: "skuId",
            newValue: "1",
          },
        ],
      },
    ];

    await expect(
      updateInventoryBatch(mockInvalidInventoryUpdates)
    ).rejects.toThrow("no record found for skuBatchId 2");
  });

  it("should log and re-throw an error if the API request fails", async () => {
    const mockError = new Error("no record found for skuBatchId 1");

    // Mock the axios.post method to return a rejected promise
    (axios.post as jest.Mock).mockRejectedValueOnce(mockError);

    await expect(updateInventoryBatch(mockInventoryUpdates)).rejects.toThrow(
      mockError
    );
  });
});
