// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TenantStorage {
    struct Tenant {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Tenant) public tenantRecords;
    string[] public tenantIds;
    mapping(string => bool) public tenantExists;

    event TenantStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event TenantUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeTenant(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !tenantExists[_recordId];

        tenantRecords[_recordId] = Tenant({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            tenantIds.push(_recordId);
            tenantExists[_recordId] = true;
            emit TenantStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit TenantUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getTenant(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(tenantExists[_recordId], "Tenant does not exist");

        Tenant memory item = tenantRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalTenant() public view returns (uint256) {
        return tenantIds.length;
    }

    function getTenantIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < tenantIds.length, "Index out of bounds");
        return tenantIds[_index];
    }

    function getAllTenantIds() public view returns (string[] memory) {
        return tenantIds;
    }

    function doesTenantExist(string memory _recordId) public view returns (bool) {
        return tenantExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalTenant,
        string[] memory allTenantIds
    ) {
        return (tenantIds.length, tenantIds);
    }

    function getTenantMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(tenantExists[_recordId], "Tenant does not exist");

        Tenant memory item = tenantRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
