import { ref, reactive } from "vue";

export function useTable<T>() {
    const data = ref<T[]>([]);
    const loading = ref(false);
    const pagination = reactive({
        total: 0,
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10', '20', '50', '100']
    });
    const sort = reactive({
        sortBy: "",
        sortOrder: "",
    });
    const interval = ref<number | null>(null);

    // ฟังก์ชันโหลดข้อมูล table, ต้องกำหนดจาก page
    const onLoadTable = ref<() => Promise<void>>(async () => {});

    function startInterval(ms = 10000) {
        stopInterval();
        interval.value = setInterval(async () => {
            await onLoadTable.value();
        }, ms);
    }

    function stopInterval() {
        if (interval.value) {
            clearInterval(interval.value);
            interval.value = null;
        }
    }

    function handleTableChange(page: any, filters: any, sorter: any, extra: any) {
        if (page.current) pagination.current = page.current;
        if (page.pageSize) pagination.pageSize = page.pageSize;

        if (sorter) {
            sort.sortBy = sorter.columnKey;
            sort.sortOrder = sorter.order === "ascend" ? "asc" : "desc";
        }

        onLoadTable.value();
    }

    function resetTable() {
        data.value = [];
        pagination.current = 1;
        pagination.total = 0;
        sort.sortBy = "";
        sort.sortOrder = "";
    }

    return {
        data,
        loading,
        pagination,
        sort,
        interval,
        onLoadTable,
        startInterval,
        stopInterval,
        handleTableChange,
        resetTable,
    };
}