
// = 007 ======================================================================
// 3DCG には、これまで見たきたように様々な照明効果があります。
// これは初めてそれをモデルとして体系立てした人、あるいは論文にまとめて発表した
// 人などに由来して名前が付けられているものもあります。
// ※ランバートも人名由来です
// そんな照明モデルのひとつ、フォンシェーディングを three.js で実現してみましょ
// う。three.js でフォンのシェーディングモデルを用いる場合は、マテリアルをそれ専
// 用のものに切り替えてやるだけで実現でき、とても手軽です。
// ============================================================================

(() => {
    window.addEventListener('load', () => {
        // 汎用変数の宣言
        let width = window.innerWidth;
        let height = window.innerHeight;
        let targetDOM = document.getElementById('webgl');

        let run = true;       // 実行フラグ
        let scene;            // シーン
        let camera;           // カメラ
        let controls;         // カメラコントロール
        let renderer;         // レンダラ
        let geometry;         // ジオメトリ
        let material;         // マテリアル
        let boxes = {};       // ボックスメッシュを格納するオブジェクト
        let directionalLight; // ディレクショナルライト（平行光源）
        let ambientLight;     // アンビエントライト（環境光）
        let axesHelper;       // 軸ヘルパーメッシュ
        let isDown = false;   // マウスボタンが押されているかどうか

        const BOXES_PARAM = {
            rowCount: 10,    // boxが縦に並ぶ個数
            columnCount: 10, // boxが縦に並ぶ個数
        };
        const CAMERA_PARAM = {
            fovy: 90,
            aspect: width / height,
            near: 0.1,
            far: 15.0,
            x: 1.0,
            y: 1.0,
            z: 7.0,
            lookAt: new THREE.Vector3(0.0, 0.0, 0.0)
        };
        const RENDERER_PARAM = {
            clearColor: 0x333333,
            width: width,
            height: height
        };
        // - スペキュラ成分をマテリアルに追加する -----------------------------
        // phong のシェーディングモデルでは、スペキュラと呼ばれる光の反射に関す
        // るパラメータを用います。マテリアルにスペキュラ成分として利用される光
        // の色を追加します。
        // --------------------------------------------------------------------
        // change material parameter @@@
        const MATERIAL_PARAM = {
            color: 0x67B281,
            specular: 0xffffff // 反射光の色
        };
        const DIRECTIONAL_LIGHT_PARAM = {
            color: 0xffffff,
            intensity: 1.0,
            x: 1.0,
            y: 1.0,
            z: 1.0
        };
        const AMBIENT_LIGHT_PARAM = {
            color: 0xffffff,
            intensity: 0.2
        };

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
            CAMERA_PARAM.fovy,
            CAMERA_PARAM.aspect,
            CAMERA_PARAM.near,
            CAMERA_PARAM.far
        );
        camera.position.x = CAMERA_PARAM.x;
        camera.position.y = CAMERA_PARAM.y;
        camera.position.z = CAMERA_PARAM.z;
        camera.lookAt(CAMERA_PARAM.lookAt);

        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(RENDERER_PARAM.clearColor));
        renderer.setSize(RENDERER_PARAM.width, RENDERER_PARAM.height);
        targetDOM.appendChild(renderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);

        geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
        // - マテリアルの種類を変更 -------------------------------------------
        // three.js の組み込みのマテリアルの中から、フォンシェーディング用のもの
        // を利用するように変更します。
        // フォンさんが考えた証明モデルなのでフォンマテリアル
        // --------------------------------------------------------------------
        // change mesh type @@@
        material = new THREE.MeshPhongMaterial(MATERIAL_PARAM);

        for(rowIndex = 0; rowIndex < BOXES_PARAM.rowCount; rowIndex++) {
            boxes[rowIndex] = {};
            for(columnIndex = 0; columnIndex < BOXES_PARAM.columnCount; columnIndex++) {
                boxes[rowIndex][columnIndex] = new THREE.Mesh(geometry, material);
                boxes[rowIndex][columnIndex].position.x = 0 - half(BOXES_PARAM.rowCount) + columnIndex;
                boxes[rowIndex][columnIndex].position.y = 0 - half(BOXES_PARAM.columnCount) + rowIndex;
                scene.add(boxes[rowIndex][columnIndex]);
            };
        };

        directionalLight = new THREE.DirectionalLight(
            DIRECTIONAL_LIGHT_PARAM.color,
            DIRECTIONAL_LIGHT_PARAM.intensity,
        );
        directionalLight.position.x = DIRECTIONAL_LIGHT_PARAM.x;
        directionalLight.position.y = DIRECTIONAL_LIGHT_PARAM.y;
        directionalLight.position.z = DIRECTIONAL_LIGHT_PARAM.z;
        scene.add(directionalLight);

        ambientLight = new THREE.AmbientLight(
            AMBIENT_LIGHT_PARAM.color,
            AMBIENT_LIGHT_PARAM.intensity,
        );
        scene.add(ambientLight);

        axesHelper = new THREE.AxesHelper(10.0);
        scene.add(axesHelper);

        window.addEventListener('keydown', (eve) => {
            run = eve.key !== 'Escape';
        }, false);

        window.addEventListener('mousemove', (eve) => {
            let horizontal = (eve.clientX / width - 0.5) * 2.0;
            let vertical   = -(eve.clientY / height - 0.5) * 2.0;
            // box.position.x = horizontal;
            // box.position.y = vertical;
        }, false);
        window.addEventListener('mousedown', () => {
            isDown = true;
        }, false);
        window.addEventListener('mouseup', () => {
            isDown = false;
        }, false);

        render();

        function render() {
            if(run) {
                requestAnimationFrame(render);
            }

            // 常時、横にboxを回転させる
            for(rowIndex = 0; rowIndex < BOXES_PARAM.rowCount; rowIndex++) {
                for(columnIndex = 0; columnIndex < BOXES_PARAM.columnCount; columnIndex++) {
                    boxes[rowIndex][columnIndex].rotation.y += 0.01;
                };
            };

            // ボタン押下中、縦にboxを回転させる
            if(isDown === true) {
                for(rowIndex = 0; rowIndex < BOXES_PARAM.rowCount; rowIndex++) {
                    for(columnIndex = 0; columnIndex < BOXES_PARAM.columnCount; columnIndex++) {
                        boxes[rowIndex][columnIndex].rotation.x += 0.02;
                    };
                };
            };

            renderer.render(scene, camera);
        };

        /**
         * 数値を2分割して返す
         *
         * @param  int $num
         * @return int
         */
        function half(num) {
            return num / 2;
        };

    }, false);
})();