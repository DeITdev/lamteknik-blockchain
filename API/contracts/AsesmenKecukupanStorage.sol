// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AsesmenKecukupanStorage {
    struct AsesmenKecukupan {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => AsesmenKecukupan) public asesmenKecukupanRecords;
    string[] public asesmenKecukupanIds;
    mapping(string => bool) public asesmenKecukupanExists;

    event AsesmenKecukupanStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event AsesmenKecukupanUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeAsesmenKecukupan(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !asesmenKecukupanExists[_recordId];

        asesmenKecukupanRecords[_recordId] = AsesmenKecukupan({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            asesmenKecukupanIds.push(_recordId);
            asesmenKecukupanExists[_recordId] = true;
            emit AsesmenKecukupanStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit AsesmenKecukupanUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getAsesmenKecukupan(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(asesmenKecukupanExists[_recordId], "AsesmenKecukupan does not exist");

        AsesmenKecukupan memory item = asesmenKecukupanRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalAsesmenKecukupan() public view returns (uint256) {
        return asesmenKecukupanIds.length;
    }

    function getAsesmenKecukupanIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < asesmenKecukupanIds.length, "Index out of bounds");
        return asesmenKecukupanIds[_index];
    }

    function getAllAsesmenKecukupanIds() public view returns (string[] memory) {
        return asesmenKecukupanIds;
    }

    function doesAsesmenKecukupanExist(string memory _recordId) public view returns (bool) {
        return asesmenKecukupanExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalAsesmenKecukupan,
        string[] memory allAsesmenKecukupanIds
    ) {
        return (asesmenKecukupanIds.length, asesmenKecukupanIds);
    }

    function getAsesmenKecukupanMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(asesmenKecukupanExists[_recordId], "AsesmenKecukupan does not exist");

        AsesmenKecukupan memory item = asesmenKecukupanRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
