import React from 'react'
import Tilt, { HTMLVanillaTiltElement } from 'vanilla-tilt'
import useImageZoom from '../../vendors/use-image-zoom'
import { FiArrowDown } from 'react-icons/fi'
import { IoCloudOfflineOutline, IoCheckmarkCircle, IoEllipseOutline } from 'react-icons/io5'
import css from './size.module.css'
import { SizeWithSrc, UCMeta } from '../../types'
import { getUrl, getCrookedUrl, getSizeKey } from '../../helpers'
import { detect } from 'detect-browser'

interface Props extends SizeWithSrc {
	ucMeta: UCMeta,
	app: string,
	description?: string,
	positionSrc?: string,
}

const zoomDuration = 300
const tiltSpeed = zoomDuration

const Size: React.FC<Props> = props => {
	const url = getUrl(props.src, props.width, props.height, props.ucMeta)
	const fallbackUrl = getUrl(props.src, 10, 10, {
		...props.ucMeta,
		compress: false,
	})
	const previewUrl = getCrookedUrl(props.src, props.width, props.height, props.ucMeta)
	const alt = getSizeKey(props)
	const id = `${props.app}${props.name}${props.width}x${props.height}`.replaceAll(' ', '').replaceAll('(', '').replaceAll(')', '')
	const tiltWrapperRef = React.useRef<HTMLDivElement & HTMLVanillaTiltElement>(null)

	const [isZoomed, setIsZoomed] = React.useState<boolean>(false)
	const [loaded, setLoaded] = React.useState<boolean>(true)
	const [error, setError] = React.useState<boolean>(false)

	const { ref: zoomRef } = useImageZoom({
		// @ts-ignore
		zoomed: error ? false : isZoomed,
		onZoomChange: setIsZoomed,
		transitionDuration: zoomDuration,
		overlayBgColor: 'var(--b)',
		zoomMargin: 30,
	})

	React.useEffect(() => {
		const browserName = detect()
		if (!browserName || browserName.name === 'safari' || browserName.name === 'ios') return
		const current = tiltWrapperRef.current
		if (!current) return

		if (!isZoomed && !current.vanillaTilt) {
			setTimeout(() => Tilt.init(current, {
				max: 3,
				perspective: 2000,
				scale: 1.02,
				easing: 'cubic-bezier(.17, .67, .24, 1.01)',
				'mouse-event-element': `#${id}`,
				speed: tiltSpeed,
				transition: false,
			}), zoomDuration)
		}

		return () => current?.vanillaTilt?.destroy()
	}, [isZoomed, id])

	const detectButterLoading = React.useCallback(e => {
		const classList = e.target.classList
		const imgLoaded =
			classList.contains('butter-loaded') ||
			!classList.contains('butter-loading')
		setLoaded(imgLoaded)
	}, [])

	const visibleImageCommonProps = {
		width: props.width + 1,
		height: props.height + 1,
		src: previewUrl,
		style: {
			width: `${props.width + 1}px`,
		}
	}

	const handleLoadError = React.useCallback(() => {
		setError(true)
	}, [])

	return (
		<div className={css.root}>
			<h3 className={css.heading}>
				{props.name}
			</h3>

			{(props.description || props.positionSrc) && (
				<div className={css.description}>
					{ props.positionSrc && (
						<img
							src={props.positionSrc}
							className={css.descriptionImage}
							alt=''
							aria-hidden="true"
							width={60}
						/>
					)}
					{ props.description && (
						<p className={css.p}>
							{props.description}
						</p>
					)}
				</div>
			)}

			<div className={loaded ? css.imageWrapper : css.imageWrapperGhost} id={id}>
				<div
					className={!error ? css.imgTiltWrapper : css.imgTiltWrapperError}
					ref={tiltWrapperRef}
					data-tilt
				>
					<div
						ref={zoomRef as React.Ref<HTMLDivElement>}
						className={!isZoomed ? css.fakeImageWrapper : css.fakeImageWrapperZoomed}
					>
						<img
							{...visibleImageCommonProps}
							className={css.fakeImage}
							alt=''
							aria-hidden={true}
						/>
					</div>
					{ !error ? (
						<img
							{...visibleImageCommonProps}
							className={css.image}
							alt={alt}
							onAnimationEnd={detectButterLoading}
							onError={handleLoadError}
						/>
					) : (
						<div className={css.errorContainer} style={{
							width: props.width,
							paddingBottom: `${(props.height / props.width) * 100}%`,
						}}>
							<p className={css.errorContainerContent}>
								<IoCloudOfflineOutline
									className={css.errorContainerContentIcon}
									aria-hidden={true}
								/>
								We're having trouble displaying that image. You can download it directly.
								<span className={css.errorContainerButtonWrapper}>
									<a
										className={css.errorContainerButton}
										href={url}
										target='_blank'
										rel='noreferrer'
										download={`${alt}.${props.ucMeta.extension}`}
										aria-label={`Download ${alt}.${props.ucMeta.extension}`}
										title={`Download ${alt}.${props.ucMeta.extension}`}
									>
										<FiArrowDown aria-hidden={true} />
									</a>
								</span>
							</p>
							<div className={css.errorContainerBg} style={{
								backgroundImage: `url(${fallbackUrl})`,
							}} />
							<div className={css.errorContainerBgFallback} />
						</div>
					)}

					<label className={css.checkboxWrapper}>
						<input
							type='checkbox'
							className={css.checkbox}
							data-app={props.app}
							data-name={props.name}
							data-width={props.width}
							data-height={props.height}
							data-checkbox
						/>
						<IoEllipseOutline className={css.checkboxBack} />
						<IoCheckmarkCircle className={css.checkboxFront}/>
					</label>

					<div className={css.infoOverlay}>
						<div className={css.infoOverlayContent}>
							<p className={css.infoOverlayText}>
								{props.ucMeta.extension.toUpperCase()}, {props.width}x{props.height}
							</p>
							<a
								className={css.download}
								href={url}
								target='_blank'
								rel='noreferrer'
								download={`${alt}.${props.ucMeta.extension}`}
								aria-label={`Download ${alt}.${props.ucMeta.extension}`}
								title={`Download ${alt}.${props.ucMeta.extension}`}
							>
								<FiArrowDown aria-hidden={true} />
							</a>
						</div>
					</div>
					<div className={css.gradient} aria-hidden={true} />
				</div>
			</div>
		</div>
	)
}

export default Size
