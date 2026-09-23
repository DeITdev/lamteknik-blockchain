// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KeputusanMaStorage {
    struct KeputusanMa {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => KeputusanMa) public keputusanMaRecords;
    string[] public keputusanMaIds;
    mapping(string => bool) public keputusanMaExists;

    event KeputusanMaStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event KeputusanMaUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeKeputusanMa(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !keputusanMaExists[_recordId];

        keputusanMaRecords[_recordId] = KeputusanMa({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            keputusanMaIds.push(_recordId);
            keputusanMaExists[_recordId] = true;
            emit KeputusanMaStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit KeputusanMaUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getKeputusanMa(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(keputusanMaExists[_recordId], "KeputusanMa does not exist");

        KeputusanMa memory item = keputusanMaRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalKeputusanMa() public view returns (uint256) {
        return keputusanMaIds.length;
    }

    function getKeputusanMaIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < keputusanMaIds.length, "Index out of bounds");
        return keputusanMaIds[_index];
    }

    function getAllKeputusanMaIds() public view returns (string[] memory) {
        return keputusanMaIds;
    }

    function doesKeputusanMaExist(string memory _recordId) public view returns (bool) {
        return keputusanMaExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalKeputusanMa,
        string[] memory allKeputusanMaIds
    ) {
        return (keputusanMaIds.length, keputusanMaIds);
    }

    function getKeputusanMaMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(keputusanMaExists[_recordId], "KeputusanMa does not exist");

        KeputusanMa memory item = keputusanMaRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
