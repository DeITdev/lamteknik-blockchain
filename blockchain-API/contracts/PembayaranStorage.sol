// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PembayaranStorage {
    struct Pembayaran {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Pembayaran) public pembayaranRecords;
    string[] public pembayaranIds;
    mapping(string => bool) public pembayaranExists;

    event PembayaranStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event PembayaranUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storePembayaran(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !pembayaranExists[_recordId];

        pembayaranRecords[_recordId] = Pembayaran({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            pembayaranIds.push(_recordId);
            pembayaranExists[_recordId] = true;
            emit PembayaranStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit PembayaranUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getPembayaran(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(pembayaranExists[_recordId], "Pembayaran does not exist");

        Pembayaran memory item = pembayaranRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalPembayaran() public view returns (uint256) {
        return pembayaranIds.length;
    }

    function getPembayaranIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < pembayaranIds.length, "Index out of bounds");
        return pembayaranIds[_index];
    }

    function getAllPembayaranIds() public view returns (string[] memory) {
        return pembayaranIds;
    }

    function doesPembayaranExist(string memory _recordId) public view returns (bool) {
        return pembayaranExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalPembayaran,
        string[] memory allPembayaranIds
    ) {
        return (pembayaranIds.length, pembayaranIds);
    }

    function getPembayaranMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(pembayaranExists[_recordId], "Pembayaran does not exist");

        Pembayaran memory item = pembayaranRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
