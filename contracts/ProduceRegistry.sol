// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ProduceRegistry {
    struct Batch {
        bool exists;
        address owner;
        string product;
        string location;
        string harvestDate;
        uint256 quantity;
        uint256 pricePerKg;
        string status; // Created, In Transit, Sold
    }

    mapping(string => Batch) public batches; // batchId => Batch

    event BatchCreated(string indexed batchId, address indexed owner, string product, uint256 quantity, uint256 pricePerKg);
    event OwnershipTransferred(string indexed batchId, address indexed from, address indexed to);
    event StatusUpdated(string indexed batchId, string status);
    event PriceUpdated(string indexed batchId, uint256 pricePerKg);

    modifier onlyOwner(string memory batchId) {
        require(batches[batchId].exists, "BATCH_NOT_FOUND");
        require(batches[batchId].owner == msg.sender, "NOT_OWNER");
        _;
    }

    function createBatch(
        string memory batchId,
        string memory product,
        string memory location,
        string memory harvestDate,
        uint256 quantity,
        uint256 pricePerKg
    ) external {
        require(!batches[batchId].exists, "ALREADY_EXISTS");
        batches[batchId] = Batch({
            exists: true,
            owner: msg.sender,
            product: product,
            location: location,
            harvestDate: harvestDate,
            quantity: quantity,
            pricePerKg: pricePerKg,
            status: "Created"
        });
        emit BatchCreated(batchId, msg.sender, product, quantity, pricePerKg);
    }

    function transferOwnership(string memory batchId, address to) external onlyOwner(batchId) {
        address from = batches[batchId].owner;
        batches[batchId].owner = to;
        batches[batchId].status = "In Transit";
        emit OwnershipTransferred(batchId, from, to);
        emit StatusUpdated(batchId, "In Transit");
    }

    function setStatus(string memory batchId, string memory status_) external onlyOwner(batchId) {
        batches[batchId].status = status_;
        emit StatusUpdated(batchId, status_);
    }

    function setPrice(string memory batchId, uint256 pricePerKg) external onlyOwner(batchId) {
        batches[batchId].pricePerKg = pricePerKg;
        emit PriceUpdated(batchId, pricePerKg);
    }

    function getBatch(string memory batchId) external view returns (
        bool exists,
        address owner,
        string memory product,
        string memory location,
        string memory harvestDate,
        uint256 quantity,
        uint256 pricePerKg,
        string memory status
    ) {
        Batch memory b = batches[batchId];
        return (b.exists, b.owner, b.product, b.location, b.harvestDate, b.quantity, b.pricePerKg, b.status);
    }
}


