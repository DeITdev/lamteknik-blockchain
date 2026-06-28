// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ResponAsesorStorage {
    struct ResponAsesor {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => ResponAsesor) public responAsesorRecords;
    string[] public responAsesorIds;
    mapping(string => bool) public responAsesorExists;

    event ResponAsesorStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event ResponAsesorUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeResponAsesor(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !responAsesorExists[_recordId];

        responAsesorRecords[_recordId] = ResponAsesor({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            responAsesorIds.push(_recordId);
            responAsesorExists[_recordId] = true;
            emit ResponAsesorStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit ResponAsesorUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getResponAsesor(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(responAsesorExists[_recordId], "ResponAsesor does not exist");

        ResponAsesor memory item = responAsesorRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalResponAsesor() public view returns (uint256) {
        return responAsesorIds.length;
    }

    function getResponAsesorIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < responAsesorIds.length, "Index out of bounds");
        return responAsesorIds[_index];
    }

    function getAllResponAsesorIds() public view returns (string[] memory) {
        return responAsesorIds;
    }

    function doesResponAsesorExist(string memory _recordId) public view returns (bool) {
        return responAsesorExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalResponAsesor,
        string[] memory allResponAsesorIds
    ) {
        return (responAsesorIds.length, responAsesorIds);
    }

    function getResponAsesorMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(responAsesorExists[_recordId], "ResponAsesor does not exist");

        ResponAsesor memory item = responAsesorRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
