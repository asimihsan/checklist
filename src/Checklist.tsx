import React, { useEffect, useRef } from 'react';

interface ChecklistProps {
    html: string;
}

const Checklist: React.FC<ChecklistProps> = ({ html }) => {
    const divRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (divRef.current) {
            const listItems = divRef.current.querySelectorAll('li');
            const topLevelUl = divRef.current.querySelector('ul');
            if (topLevelUl) {
                (topLevelUl as HTMLElement).style.listStyleType = 'none';
            }
            listItems.forEach((listItem) => {
                const checkbox = listItem.querySelector('input[type="checkbox"]');
                const subItems = listItem.querySelectorAll('ul > li');
                if (checkbox && subItems.length > 0) {
                    // Remove the disabled attribute from the checkbox
                    (checkbox as HTMLInputElement).disabled = false;

                    // Remove the disabled attribute from all sub-item checkboxes
                    subItems.forEach(subItem => {
                        const subItemCheckbox = subItem.querySelector('input[type="checkbox"]');
                        if (subItemCheckbox) {
                            (subItemCheckbox as HTMLInputElement).disabled = false;
                        }
                    });

                    // Hide the sub-items by default
                    subItems.forEach(subItem => {
                        (subItem as HTMLElement).style.display = 'none';
                    });

                    // Add a change event listener to show/hide the sub-items when the checkbox is checked/unchecked
                    checkbox.addEventListener('change', () => {
                        subItems.forEach(subItem => {
                            (subItem as HTMLElement).style.display = (checkbox as HTMLInputElement).checked ? 'block' : 'none';
                        });
                    });
                }
            });
        }
    }, [html]);

    return (
        <div ref={divRef} dangerouslySetInnerHTML={{ __html: html }} />
    );
};

export default Checklist;
