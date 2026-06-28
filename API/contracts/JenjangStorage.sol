// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract JenjangStorage {
    struct Jenjang {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Jenjang) public jenjangRecords;
    string[] public jenjangIds;
    mapping(string => bool) public jenjangExists;

    event JenjangStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event JenjangUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeJenjang(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !jenjangExists[_recordId];

        jenjangRecords[_recordId] = Jenjang({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            jenjangIds.push(_recordId);
            jenjangExists[_recordId] = true;
            emit JenjangStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit JenjangUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getJenjang(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(jenjangExists[_recordId], "Jenjang does not exist");

        Jenjang memory item = jenjangRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalJenjang() public view returns (uint256) {
        return jenjangIds.length;
    }

    function getJenjangIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < jenjangIds.length, "Index out of bounds");
        return jenjangIds[_index];
    }

    function getAllJenjangIds() public view returns (string[] memory) {
        return jenjangIds;
    }

    function doesJenjangExist(string memory _recordId) public view returns (bool) {
        return jenjangExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalJenjang,
        string[] memory allJenjangIds
    ) {
        return (jenjangIds.length, jenjangIds);
    }

    function getJenjangMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(jenjangExists[_recordId], "Jenjang does not exist");

        Jenjang memory item = jenjangRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
