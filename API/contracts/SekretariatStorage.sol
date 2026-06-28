// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SekretariatStorage {
    struct Sekretariat {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Sekretariat) public sekretariatRecords;
    string[] public sekretariatIds;
    mapping(string => bool) public sekretariatExists;

    event SekretariatStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event SekretariatUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeSekretariat(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !sekretariatExists[_recordId];

        sekretariatRecords[_recordId] = Sekretariat({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            sekretariatIds.push(_recordId);
            sekretariatExists[_recordId] = true;
            emit SekretariatStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit SekretariatUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getSekretariat(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(sekretariatExists[_recordId], "Sekretariat does not exist");

        Sekretariat memory item = sekretariatRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalSekretariat() public view returns (uint256) {
        return sekretariatIds.length;
    }

    function getSekretariatIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < sekretariatIds.length, "Index out of bounds");
        return sekretariatIds[_index];
    }

    function getAllSekretariatIds() public view returns (string[] memory) {
        return sekretariatIds;
    }

    function doesSekretariatExist(string memory _recordId) public view returns (bool) {
        return sekretariatExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalSekretariat,
        string[] memory allSekretariatIds
    ) {
        return (sekretariatIds.length, sekretariatIds);
    }

    function getSekretariatMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(sekretariatExists[_recordId], "Sekretariat does not exist");

        Sekretariat memory item = sekretariatRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
