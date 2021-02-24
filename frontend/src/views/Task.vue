<template>
  <div id="task">
    <el-container>
      <el-header
        height="45px"
        id="header"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
        "
      >
        <h1>Webpage Extractor</h1>
        <el-button type="primary" style="height: 40px" @click="createNewTask()"
          >Create New Task</el-button
        >
      </el-header>
      <el-divider style="magin: 0 1rem"></el-divider>
      <el-main>
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="name" label="Task Name" min-width="280">
            <template slot-scope="scope">
              <div>{{ scope.row.name }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop=""
            label="Task Urls"
            min-width="100"
            align="center"
          >
            <template slot-scope="scope">
              <el-button size="small" @click="showUrlDetail(scope.row._id)"
                >View Detail</el-button
              >
            </template>
          </el-table-column>
          <el-table-column
            prop=""
            label="Task Rules"
            min-width="105"
            align="center"
          >
            <template slot-scope="scope">
              <el-button size="small" @click="showRuleDetail(scope.row._id)"
                >View Detail</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="Task Progress" width="180">
            <template slot-scope="scope">
              <el-progress :percentage="scope.row.progress"></el-progress>
            </template>
          </el-table-column>
          <el-table-column prop="" label="Result" width="100">
            <template slot-scope="scope">
              <el-button size="small" @click="showResult(scope.row._id)"
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
                @click="deleteTask(scope.$index, scope.row._id)"
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
    </el-container>
    <el-dialog
      title="Urls Detail"
      :visible.sync="urlDetailVisiable"
      width="50%"
    >
      <pre v-for="(url, idx) in urlContent" :key="idx">
        {{ idx + 1 }}: {{ url }}
      </pre>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="urlDetailVisiable = false"
          >Confirm</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      title="Rules Detail"
      :visible.sync="ruleDetailVisiable"
      width="50%"
    >
      <pre v-for="(rule, idx) in ruleContent" :key="idx">
        {{ idx + 1 }}: {{ JSON.stringify(rule) }}
      </pre>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="ruleDetailVisiable = false"
          >Confirm</el-button
        >
      </span>
    </el-dialog>
    <el-dialog title="New Task" :visible.sync="newTaskVisiable" width="90%">
      <el-form ref="form" :rules="formRule" :model="form" label-width="100px">
        <el-form-item label="Task Name:" prop="name" required>
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="Rules:" prop="rules" required>
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 20 }"
            placeholder="Please input array of rules"
            v-model="form.rules"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="URLs:" prop="urls" required>
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 10 }"
            placeholder="Please input array of urls. One url per row."
            v-model="form.urls"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="newTaskVisiable = false">Cancel</el-button>
        <el-button type="primary" @click="submitNewTask()">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Task",
  created: async function () {
    this.refreshTable();
  },
  data: () => ({
    currentPage: 1,
    totalCount: 1,
    tableData: [],
    urlContent: "",
    ruleContent: "",
    urlDetailVisiable: false,
    ruleDetailVisiable: false,
    newTaskVisiable: false,
    form: {
      name: "",
      rules: "",
      urls: "",
    },
    formRule: {
      name: [
        { required: true, message: "Task name is required.", trigger: "blur" },
      ],
      rules: [
        {
          validator: (rule, value, cb) => {
            try {
              let parseResult = JSON.parse(value);
              if (
                !Array.isArray(parseResult) ||
                parseResult.filter((r) => typeof r === "object").length !=
                  parseResult.length
              )
                cb(new Error("Input should be an array of rule objects"));
              else if (parseResult.length === 0)
                cb(new Error("At least give me one rule, please"));
              else if (
                parseResult.filter((r) => Object.entries(r).length > 1).length >
                0
              )
                cb(new Error("Each rule should only have one entry"));
              else if (
                parseResult
                  .filter(
                    (r) =>
                      Object.keys(r)[0] === "RETRIEVE_HEADER" ||
                      Object.keys(r)[0] === "RETRIEVE_FOOTER"
                  )
                  .filter((r) => typeof Object.values(r)[0] === "object")
                  .filter(
                    (r) =>
                      Object.entries(Object.values(r)[0]).length > 1 ||
                      Object.values(r)[0]["by"] === undefined
                  ).length > 0
              )
                cb(
                  new Error(
                    'RETRIEVE_HEADER/FOOTER can only accept an option like {"by": ONE_OF("tag","class","id")}'
                  )
                );
              else if (
                parseResult
                  .filter(
                    (r) =>
                      Object.keys(r)[0] === "RETRIEVE_HEADER" ||
                      Object.keys(r)[0] === "RETRIEVE_FOOTER"
                  )
                  .filter((r) => typeof Object.values(r)[0] === "object")
                  .filter(
                    (r) =>
                      !["class", "tag", "id"].includes(
                        Object.values(r)[0]["by"]
                      )
                  ).length > 0
              )
                cb(
                  new Error(
                    "RETRIEVE_HEADER/FOOTER can only by tag, id, or class"
                  )
                );
              else cb();
            } catch (error) {
              cb(new Error("Cannot parse rules into JSON"));
            }
          },
          trigger: "blur",
        },
      ],
      urls: [{ required: true, message: "url is required.", trigger: "blur" }],
    },
  }),
  methods: {
    refreshTable: async function () {
      let { tasks, totalCount } = (
        await this.axios.get(`/task?page=${this.currentPage}`)
      ).data;
      this.tableData = tasks;
      this.totalCount = totalCount;
    },
    deleteTask: function (idx, taskId) {
      this.$confirm(
        `Deleting task: ${this.tableData[idx].name}`,
        "Delete Task",
        {
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      )
        .then(async () => {
          try {
            await this.axios.delete(`/task/${taskId}`);
            this.refreshTable();
            this.$message({
              type: "success",
              message: `Deleted`,
            });
          } catch (error) {
            this.$message.error(
              `Failed to delete task ${taskId} with error:${error.message}`
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
    showUrlDetail: function (taskId) {
      this.urlContent = this.tableData.filter((e) => e._id === taskId)[0].urls;
      this.urlDetailVisiable = true;
    },
    showRuleDetail: function (taskId) {
      this.ruleContent = this.tableData.filter(
        (e) => e._id === taskId
      )[0].rules;
      this.ruleDetailVisiable = true;
    },
    createNewTask: function () {
      if (this.$refs["form"]) this.$refs["form"].resetFields();
      this.form = {
        name: "",
        rules: "",
        urls: "",
      };
      this.newTaskVisiable = true;
    },
    submitNewTask: function () {
      this.$refs["form"].validate(async (valid) => {
        if (valid) {
          let Task = {
            name: this.form.name,
            rules: JSON.parse(this.form.rules),
            urls: this.form.urls.split("\n"),
          };
          await this.axios.post("/task", Task).catch(alert);
          this.newTaskVisiable = false;
          this.refreshTable();
        } else {
          return false;
        }
      });
    },
    handleCurrentChange: async function (val) {
      this.currentPage = val;
      this.refreshTable();
    },
    showResult: function (taskId) {
      this.$router.push(`/result?id=${taskId}`);
    },
  },
};
</script>

<style lang="less" scoped>
#task {
  position: absolute;
  width: 100%;
}
h4,
pre {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
