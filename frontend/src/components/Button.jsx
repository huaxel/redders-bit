import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Button component that can act as a link or a regular button.
 * Supports variants: primary, secondary, danger.
 */
const Button = ({ children, to, onClick, variant = 'primary', className = '', ...props }) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const combinedClassName = `${baseClass} ${variantClass} ${className}`;

    if (to) {
        return (
            <Link to={to} className={combinedClassName} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button className={combinedClassName} onClick={onClick} {...props}>
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    to: PropTypes.string,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
    className: PropTypes.string,
};

export default Button;
