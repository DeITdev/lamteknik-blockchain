// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UppsStorage {
    struct Upps {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Upps) public uppsRecords;
    string[] public uppsIds;
    mapping(string => bool) public uppsExists;

    event UppsStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event UppsUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeUpps(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !uppsExists[_recordId];

        uppsRecords[_recordId] = Upps({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            uppsIds.push(_recordId);
            uppsExists[_recordId] = true;
            emit UppsStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit UppsUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getUpps(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(uppsExists[_recordId], "Upps does not exist");

        Upps memory item = uppsRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalUpps() public view returns (uint256) {
        return uppsIds.length;
    }

    function getUppsIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < uppsIds.length, "Index out of bounds");
        return uppsIds[_index];
    }

    function getAllUppsIds() public view returns (string[] memory) {
        return uppsIds;
    }

    function doesUppsExist(string memory _recordId) public view returns (bool) {
        return uppsExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalUpps,
        string[] memory allUppsIds
    ) {
        return (uppsIds.length, uppsIds);
    }

    function getUppsMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(uppsExists[_recordId], "Upps does not exist");

        Upps memory item = uppsRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
