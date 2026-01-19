import React, { useState } from 'react';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';
import AddListModal from '@renderer/components/TodoList/components/Modal/AddListModal';
import styles from './Sidebar.module.css';

function Sidebar() {
  const lists = useTodoStore((state) => state.lists);
  const currentView = useTodoStore((state) => state.currentView);
  const setCurrentView = useTodoStore((state) => state.setCurrentView);
  const addList = useTodoStore((state) => state.addList);

  const [showAddListModal, setShowAddListModal] = useState(false);

  const handleAddList = (name: string, icon: string, color: string) => {
    addList(name, icon, color);
    setShowAddListModal(false);
  };

  // Separate smart lists from custom lists
  const smartLists = lists.filter((list) => list.isInbox || list.id === 'list-today' || list.id === 'list-week');
  const customLists = lists.filter((list) => !list.isInbox && list.id !== 'list-today' && list.id !== 'list-week');

  return (
    <div className={styles.sidebar}>
      {/* Smart Lists Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>智能清单</h3>
        <ul className={styles.list}>
          {smartLists.map((list) => (
            <li key={list.id}>
              <button
                onClick={() => setCurrentView(list.id)}
                className={`${styles.listItem} ${currentView === list.id ? styles.active : ''}`}
              >
                <span className={styles.listIcon}>{list.icon}</span>
                <span className={styles.listName}>{list.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Custom Lists Section */}
      {customLists.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>自定义清单</h3>
          <ul className={styles.list}>
            {customLists.map((list) => (
              <li key={list.id}>
                <button
                  onClick={() => setCurrentView(list.id)}
                  className={`${styles.listItem} ${currentView === list.id ? styles.active : ''}`}
                >
                  <span className={styles.listIcon}>{list.icon}</span>
                  <span className={styles.listName}>{list.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add List Button */}
      <div className={styles.section}>
        <button
          className={styles.addListBtn}
          onClick={() => setShowAddListModal(true)}
        >
          <span>+</span>
          <span>添加清单</span>
        </button>
      </div>

      {/* Add List Modal */}
      {showAddListModal && (
        <AddListModal
          onClose={() => setShowAddListModal(false)}
          onAddList={handleAddList}
        />
      )}
    </div>
  );
}

export default Sidebar;
