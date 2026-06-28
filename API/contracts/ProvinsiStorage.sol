// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProvinsiStorage {
    struct Provinsi {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Provinsi) public provinsiRecords;
    string[] public provinsiIds;
    mapping(string => bool) public provinsiExists;

    event ProvinsiStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event ProvinsiUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeProvinsi(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !provinsiExists[_recordId];

        provinsiRecords[_recordId] = Provinsi({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            provinsiIds.push(_recordId);
            provinsiExists[_recordId] = true;
            emit ProvinsiStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit ProvinsiUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getProvinsi(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(provinsiExists[_recordId], "Provinsi does not exist");

        Provinsi memory item = provinsiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalProvinsi() public view returns (uint256) {
        return provinsiIds.length;
    }

    function getProvinsiIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < provinsiIds.length, "Index out of bounds");
        return provinsiIds[_index];
    }

    function getAllProvinsiIds() public view returns (string[] memory) {
        return provinsiIds;
    }

    function doesProvinsiExist(string memory _recordId) public view returns (bool) {
        return provinsiExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalProvinsi,
        string[] memory allProvinsiIds
    ) {
        return (provinsiIds.length, provinsiIds);
    }

    function getProvinsiMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(provinsiExists[_recordId], "Provinsi does not exist");

        Provinsi memory item = provinsiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
