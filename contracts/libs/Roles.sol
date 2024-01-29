// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

library Roles {
    // @notice access control role for mint
    bytes32 public constant MINTER_ROLE =
        bytes32(uint256(keccak256("access.roles.minter")) - 1);
    // @notice access control role for burn
    bytes32 public constant BURNER_ROLE =
        bytes32(uint256(keccak256("access.roles.burner")) - 1);
    // @notice access control role for pair creation
    bytes32 public constant PAIR_CREATOR_ROLE =
        bytes32(uint256(keccak256("access.roles.creator")) - 1);
}
