// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KlasterIlmuStorage {
    struct KlasterIlmu {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => KlasterIlmu) public klasterIlmuRecords;
    string[] public klasterIlmuIds;
    mapping(string => bool) public klasterIlmuExists;

    event KlasterIlmuStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event KlasterIlmuUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeKlasterIlmu(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !klasterIlmuExists[_recordId];

        klasterIlmuRecords[_recordId] = KlasterIlmu({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            klasterIlmuIds.push(_recordId);
            klasterIlmuExists[_recordId] = true;
            emit KlasterIlmuStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit KlasterIlmuUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getKlasterIlmu(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(klasterIlmuExists[_recordId], "KlasterIlmu does not exist");

        KlasterIlmu memory item = klasterIlmuRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalKlasterIlmu() public view returns (uint256) {
        return klasterIlmuIds.length;
    }

    function getKlasterIlmuIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < klasterIlmuIds.length, "Index out of bounds");
        return klasterIlmuIds[_index];
    }

    function getAllKlasterIlmuIds() public view returns (string[] memory) {
        return klasterIlmuIds;
    }

    function doesKlasterIlmuExist(string memory _recordId) public view returns (bool) {
        return klasterIlmuExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalKlasterIlmu,
        string[] memory allKlasterIlmuIds
    ) {
        return (klasterIlmuIds.length, klasterIlmuIds);
    }

    function getKlasterIlmuMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(klasterIlmuExists[_recordId], "KlasterIlmu does not exist");

        KlasterIlmu memory item = klasterIlmuRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
