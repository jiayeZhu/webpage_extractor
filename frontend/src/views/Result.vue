<template>
  <div id="result">
    <div id="page-header">
      <el-page-header @back="goBack" content="Task Records"> </el-page-header>
    </div>
    <el-divider style="magin: 0 1rem"></el-divider>
    <el-main>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="title" label="Title" min-width="280">
          <template slot-scope="scope">
            <div>{{ scope.row.title }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="url"
          label="Record Url"
          min-width="200"
          align="left"
        >
        </el-table-column>
        <el-table-column
          prop="status"
          label="Record Status"
          width="120"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop=""
          label="Extracted Text"
          width="180"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              size="small"
              @click="showResult(scope.row._id)"
              :disabled="['Failed', 'Input Error'].includes(scope.row.status)"
              >View</el-button
            >
          </template>
        </el-table-column>
        <el-table-column prop="" label="" width="120" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRecord(scope.$index, scope.row._id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="currentPage"
        id="pagination"
        background
        layout="prev, pager, next"
        :total="totalCount"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </el-main>
    <el-dialog
      title="Extracted Text"
      :visible.sync="extractedTextVisiable"
      width="90%"
    >
      <el-tree :data="treeData" :props="defaultProps"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="extractedTextVisiable = false"
          >Confirm</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created: function () {
    this.taskId = this.$route.query.id;
    this.refreshTable();
  },
  data: () => ({
    taskId: "",
    currentPage: 1,
    totalCount: 1,
    tableData: [],
    extractedTextVisiable: false,
    defaultProps: {
      children: "children",
      label: "label",
    },
    treeData: [],
    // visiableRules: [],
    // visiableResults: [],
  }),
  methods: {
    goBack: function () {
      this.$router.back();
    },
    refreshTable: async function () {
      const STATUS_MAP = {
        0: "Pending",
        1: "Working",
        2: "Succeeded",
        3: "Failed",
        4: "Input Error",
      };
      let { records, totalCount } = (
        await this.axios.get(
          `/task/${this.taskId}/record?page=${this.currentPage}`
        )
      ).data;
      this.tableData = records.map((r) => {
        r.status = STATUS_MAP[r.status];
        return r;
      });
      this.totalCount = totalCount;
    },
    handleCurrentChange: async function (val) {
      this.currentPage = val;
      this.refreshTable();
    },
    showResult: async function (recordId) {
      this.treeData = [];
      const VALID_RULES = [
        "COUNT_TAGS",
        "RETRIEVE_HEADER",
        "RETRIEVE_FOOTER",
        "RETRIEVE_BY_ID",
        "RETRIEVE_BY_CLASS",
        "RETRIEVE_BY_SELECTOR",
      ];
      try {
        let { result, rules } = (
          await this.axios.get(`/record/${recordId}`)
        ).data;
        this.visiableRules = rules.map((r) => JSON.stringify(r));
        this.visiableResults = result;
        rules.forEach((r, idx) => {
          let ruleType = Object.keys(r)[0];
          if (VALID_RULES.includes(ruleType)) {
            let treeNode = {
              label: ruleType,
              children: [],
            };
            switch (ruleType) {
              case "COUNT_TAGS": {
                let countResultMap = result[idx];
                Object.entries(countResultMap).forEach((e) => {
                  treeNode.children.push({ label: e.join(": ") });
                });
                this.treeData.push(treeNode);
                break;
              }
              case "RETRIEVE_HEADER":
              case "RETRIEVE_FOOTER": {
                let option = Object.values(r)[0];

                if (
                  typeof option === "object" &&
                  Object.keys(option).length === 1 &&
                  ["class", "tag", "id"].includes(Object.values(option)[0])
                ) {
                  treeNode.label += `_BY_${Object.values(option)[0]}`;
                }
                if (!treeNode.label.includes("_BY_id")) {
                  let retrieveResultArray = result[idx].filter(sr=>sr!=='');
                  retrieveResultArray.forEach((e) => {
                    treeNode.children.push({ label: e });
                  });
                  if (retrieveResultArray.length === 0)
                    treeNode.children.push({ label: "" });
                } else {
                  treeNode.children.push({ label: result[idx] });
                }
                this.treeData.push(treeNode);
                break;
              }
              case "RETRIEVE_BY_ID":
              case "RETRIEVE_BY_CLASS":
              case "RETRIEVE_BY_SELECTOR": {
                let targets = Object.values(r)[0];
                let subResults = result[idx];
                targets.forEach((t) => {
                  let subTreeNode = {
                    label: t,
                    children: [],
                  };
                  if (ruleType === "RETRIEVE_BY_ID")
                    subTreeNode.children.push({ label: subResults[t] });
                  else
                    subTreeNode.children = subResults[t].filter(sr=>sr!=='').map((sr) => ({
                      label: sr,
                    }));
                  if (subTreeNode.children.length == 0) subTreeNode.children.push({ label: "" })
                  treeNode.children.push(subTreeNode);
                });
                this.treeData.push(treeNode);
                break;
              }
            }
          }
        });

        this.extractedTextVisiable = true;
      } catch (error) {
        this.$message.error(
          `Failed to show extracted text with error:${error.message}`
        );
      }
    },
    deleteRecord: async function (idx, recordId) {
      this.$confirm(
        `Deleting Record: ${this.tableData[idx].title}`,
        "Delete Record",
        {
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          type: "warning"
        }
      )
        .then(async () => {
          try {
            await this.axios.delete(`/record/${recordId}`);
            this.refreshTable();
            this.$message({
              type: "info",
              message: `Deleted`,
            });
          } catch (error) {
            this.$message.error(
              `Failed to delete record ${recordId} with error:${error.message}`
            );
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "Operation Canceled",
          });
        });
    },
  },
};
</script>

<style lang="less" scoped>
#result {
  position: absolute;
  width: 100%;
}
#page-header {
  display: flex;
  align-items: center;
  margin: 1rem 20px;
  height: 45px;
}
</style>
<style lang='less'>
.el-tree-node__content {
  height: auto;
  .el-tree-node__label {
    white-space: initial;
    word-break: keep-all;
  }
}
.el-tree-node {
  .el-tree-node__children {
    .el-tree-node__content {
      .is-leaf + .el-tree-node__label {
        position: relative;
        &::before {
          content: " ";
          position: absolute;
          left: -1rem;
          top: calc(50% - 2px);
          width: 4px;
          height: 4px;
          background-color: black;
          border-radius: 2px;
        }
      }
    }
  }
}
</style>