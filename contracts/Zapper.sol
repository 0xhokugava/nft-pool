// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./integrations/uniswapv2/interfaces/IUniswapV2Router02.sol";
import "./integrations/uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./interfaces/IZapper.sol";
import "./libs/Roles.sol";

// import "hardhat/console.sol";

contract Zapper is IZapper, AccessControl {
    using SafeERC20 for IERC20;

    constructor() {
        _grantRole(Roles.MINTER_ROLE, address(this));
    }

    function zapInToken(
        address _from,
        address _pair,
        uint[] memory amounts,
        address routerAddr
    ) external {
        _approveTokenIfNeeded(_from, routerAddr);
        _swapTokenToLP(
            _from,
            _pair,
            amounts[0],
            amounts[1],
            routerAddr,
            msg.sender
        );
    }

    function zapOutToken(
        address _from,
        uint amount,
        address _to,
        address routerAddr,
        address _recipient
    ) external {}

    function _approveTokenIfNeeded(address token, address router) public {
        if (IERC20(token).allowance(address(this), router) == 0) {
            IERC20(token).approve(router, type(uint).max);
        }
    }

    function _swapTokenToLP(
        address _swapToken,
        address _pair,
        uint _amountA,
        uint _amountB,
        address _routerAddr,
        address _receiver
    ) public returns (uint liquidity) {
        address token0 = IUniswapV2Pair(_pair).token0();
        address token1 = IUniswapV2Pair(_pair).token1();

        address otherToken = _swapToken == token0 ? token1 : token0;

        _approveTokenIfNeeded(token1, _routerAddr);

        if (IERC20(_swapToken).balanceOf(address(this)) <= 0) {
            revert ZeroTokenBalance(_swapToken);
        }
        if (IERC20(otherToken).balanceOf(address(this)) <= 0) {
            revert ZeroTokenBalance(otherToken);
        }

        (, , liquidity) = IUniswapV2Router01(_routerAddr).addLiquidity(
            _swapToken,
            otherToken,
            _amountA,
            _amountB,
            0,
            0,
            _receiver,
            block.timestamp
        );
    }
}
