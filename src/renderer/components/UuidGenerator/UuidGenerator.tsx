/**
 * UUID Generator Plugin
 *
 * 生成各种格式的UUID
 */

import React, { useState } from "react";
import PluginWindow from "../PluginWindow/PluginWindow";
import styles from "./UuidGenerator.module.css";

interface UuidGeneratorProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const UuidGenerator: React.FC<UuidGeneratorProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [count, setCount] = useState<number>(1);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [removeHyphens, setRemoveHyphens] = useState<boolean>(false);
  const [uuids, setUuids] = useState<string[]>([]);

  // 生成UUID
  const generateUuids = () => {
    const newUuids: string[] = [];

    for (let i = 0; i < count; i++) {
      let uuid = crypto.randomUUID();

      if (uppercase) {
        uuid =
          uuid.toUpperCase() as `${string}-${string}-${string}-${string}-${string}`;
      }

      if (removeHyphens) {
        uuid = uuid.replace(
          /-/g,
          "",
        ) as `${string}-${string}-${string}-${string}-${string}`;
      }

      newUuids.push(uuid);
    }

    setUuids(newUuids);
  };

  // 复制单个UUID
  const copyUuid = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
  };

  // 复制所有UUID
  const copyAll = () => {
    const allUuids = uuids.join("\n");
    navigator.clipboard.writeText(allUuids);
  };

  // 清空
  const clear = () => {
    setUuids([]);
  };

  return (
    <PluginWindow
      title="UUID生成器"
      icon="🧪"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="uuid-generator-standalone"
      pluginId="uuid-generator"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 设置 */}
        <div className={styles.settings}>
          <div className={styles.settingGroup}>
            <label>数量</label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className={styles.input}
            />
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
              />
              大写
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={removeHyphens}
                onChange={(e) => setRemoveHyphens(e.target.checked)}
              />
              移除连字符
            </label>
          </div>
        </div>

        {/* 生成按钮 */}
        <button onClick={generateUuids} className={styles.generateButton}>
          生成UUID
        </button>

        {/* 结果 */}
        {uuids.length > 0 && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <h3>生成结果</h3>
              <button onClick={copyAll} className={styles.copyAllButton}>
                复制全部
              </button>
            </div>
            <div className={styles.uuidList}>
              {uuids.map((uuid, index) => (
                <div key={index} className={styles.uuidItem}>
                  <span className={styles.uuid}>{uuid}</span>
                  <button
                    onClick={() => copyUuid(uuid)}
                    className={styles.copyButton}
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className={styles.info}>
          <p>
            💡 UUID
            v4是随机生成的唯一标识符，格式为：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
          </p>
        </div>
      </div>
    </PluginWindow>
  );
};

export default UuidGenerator;
