/**
 * Mind Map Plugin
 *
 * 创建和编辑思维导图
 */

import React, { useState, useEffect } from "react";
import PluginWindow from "../PluginWindow/PluginWindow";
import styles from "./MindMap.module.css";

interface MindMapProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface Node {
  id: string;
  text: string;
  parentId: string | null;
  children: string[];
  color: string;
  collapsed: boolean;
}

const COLORS = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#f5576c",
  "#4facfe",
  "#00f2fe",
  "#43e97b",
  "#38f9d7",
];

const MindMap: React.FC<MindMapProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeText, setNodeText] = useState("");

  // 从本地存储加载
  useEffect(() => {
    const saved = localStorage.getItem("mindmap-nodes");
    if (saved) {
      setNodes(JSON.parse(saved));
    } else {
      // 创建根节点
      const rootNode: Node = {
        id: "root",
        text: "中心主题",
        parentId: null,
        children: [],
        color: COLORS[0]!,
        collapsed: false,
      };
      setNodes([rootNode]);
    }
  }, []);

  // 保存到本地存储
  useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem("mindmap-nodes", JSON.stringify(nodes));
    }
  }, [nodes]);

  // 添加子节点
  const addChildNode = (parentId: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      text: "新节点",
      parentId,
      children: [],
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      collapsed: false,
    };

    setNodes((prev) => [
      ...prev.map((node) =>
        node.id === parentId
          ? { ...node, children: [...node.children, newNode.id] }
          : node,
      ),
      newNode,
    ]);
    setSelectedNodeId(newNode.id);
  };

  // 删除节点
  const deleteNode = (nodeId: string) => {
    if (nodeId === "root") {
      alert("不能删除根节点");
      return;
    }

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // 递归收集所有子节点ID
    const collectChildIds = (id: string): string[] => {
      const n = nodes.find((node) => node.id === id);
      if (!n) return [];
      const childIds = n.children;
      return [...childIds, ...childIds.flatMap(collectChildIds)];
    };

    const idsToDelete = [nodeId, ...collectChildIds(nodeId)];

    // 从父节点的children中移除
    setNodes((prev) =>
      prev
        .filter((n) => !idsToDelete.includes(n.id))
        .map((n) =>
          n.id === node.parentId
            ? { ...n, children: n.children.filter((id) => id !== nodeId) }
            : n,
        ),
    );

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // 更新节点文本
  const updateNodeText = (nodeId: string, text: string) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, text } : node)),
    );
  };

  // 切换折叠状态
  const toggleCollapse = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, collapsed: !node.collapsed } : node,
      ),
    );
  };

  // 开始编辑节点
  const startEditing = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setEditingNodeId(nodeId);
      setNodeText(node.text);
    }
  };

  // 保存编辑
  const saveEdit = () => {
    if (editingNodeId && nodeText.trim()) {
      updateNodeText(editingNodeId, nodeText.trim());
    }
    setEditingNodeId(null);
    setNodeText("");
  };

  // 渲染节点树
  const renderNode = (node: Node, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isSelected = selectedNodeId === node.id;

    return (
      <div
        key={node.id}
        className={styles.nodeWrapper}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div
          className={`${styles.node} ${isSelected ? styles.selected : ""}`}
          onClick={() => setSelectedNodeId(node.id)}
          onDoubleClick={() => startEditing(node.id)}
          style={{ borderColor: node.color }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(node.id);
              }}
              className={styles.collapseButton}
            >
              {node.collapsed ? "▶" : "▼"}
            </button>
          )}
          {editingNodeId === node.id ? (
            <input
              type="text"
              value={nodeText}
              onChange={(e) => setNodeText(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") {
                  setEditingNodeId(null);
                  setNodeText("");
                }
              }}
              autoFocus
              className={styles.nodeInput}
            />
          ) : (
            <span className={styles.nodeText}>{node.text}</span>
          )}
          <div className={styles.nodeActions}>
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addChildNode(node.id);
                }}
                className={styles.actionButton}
                title="添加子节点"
              >
                ➕
              </button>
            )}
            {node.id !== "root" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
                className={styles.actionButton}
                title="删除节点"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
        {!node.collapsed &&
          node.children.map((childId) => {
            const child = nodes.find((n) => n.id === childId);
            return child ? renderNode(child, depth + 1) : null;
          })}
      </div>
    );
  };

  const rootNode = nodes.find((n) => n.id === "root");

  return (
    <PluginWindow
      title="思维导图"
      icon="📝"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="mindmap-standalone"
      pluginId="mindmap"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        <div className={styles.toolbar}>
          <button
            onClick={() => rootNode && addChildNode(rootNode.id)}
            className={styles.toolButton}
          >
            ➕ 添加节点
          </button>
          <button
            onClick={() => {
              if (confirm("确定要清空思维导图吗？")) {
                const newRoot: Node = {
                  id: "root",
                  text: "中心主题",
                  parentId: null,
                  children: [],
                  color: COLORS[0]!,
                  collapsed: false,
                };
                setNodes([newRoot]);
                setSelectedNodeId(null);
              }
            }}
            className={styles.toolButton}
          >
            🔄 重置
          </button>
        </div>

        <div className={styles.mapContainer}>
          {rootNode && renderNode(rootNode)}
        </div>

        <div className={styles.info}>
          <p>💡 双击节点编辑文本，点击 ➕ 添加子节点</p>
        </div>
      </div>
    </PluginWindow>
  );
};

export default MindMap;
