// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

library Common {
    function at(address _addr) public view returns (bytes memory o_code) {
        return _addr.code;
    }
}
